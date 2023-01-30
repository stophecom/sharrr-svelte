import axios from 'axios'
import axiosRetry from 'axios-retry'

import { encryptFile, decryptData, createHash, signMessage } from '$lib/crypto'
import { api, asyncPool } from '$lib/api'
import { CHUNK_SIZE } from '$lib/constants'

// If the request fails, we retry
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay })

const chunkSize = CHUNK_SIZE

type SignedUrlGetResponse = {
  url: string
}
type PresignedPostResponse = { url: string; fields: Record<string, string> }

type Chunk = {
  key: string
  signature: string
}

type FileReference = {
  name: string
  size: number
  mimeType: string
  bucket: string
  chunks: Chunk[]
}

export interface SecretFile extends FileReference {
  alias: string
  decryptionKey: string
}

type HandleFileEncryptionAndUpload = {
  file: File
  bucket: string
  masterKey: string
  privateKey: CryptoKey
  progressCallback: (progress: number) => void
}
export const handleFileEncryptionAndUpload = async ({
  file,
  bucket,
  masterKey,
  privateKey,
  progressCallback
}: HandleFileEncryptionAndUpload): Promise<Chunk[]> => {
  const fileSize = file.size
  const numberOfChunks = typeof chunkSize === 'number' ? Math.ceil(fileSize / chunkSize) : 1
  const concurrentUploads = Math.min(3, numberOfChunks)
  const progressOfEachChunk: number[] = []
  progressCallback(0)

  if (!fileSize) {
    throw new Error('Empty file (zero bytes). Please select another file.')
  }

  return asyncPool(concurrentUploads, [...new Array(numberOfChunks).keys()], async (i: number) => {
    const start = i * chunkSize
    const end = i + 1 === numberOfChunks ? fileSize : (i + 1) * chunkSize
    const chunk = file.slice(start, end)

    const encryptedFile = await encryptFile(chunk, masterKey)

    const chunkFileSize = encryptedFile.size
    const fileName = crypto.randomUUID()
    const signature = await signMessage(fileName, privateKey)

    await uploadFileChunk({
      bucket,
      chunk: encryptedFile,
      fileName: await createHash(fileName),
      size: chunkFileSize,
      progressCallback: (p) => {
        progressOfEachChunk[i] = p
        const sum = progressOfEachChunk.reduce((partialSum, a) => partialSum + a, 0)
        progressCallback(sum)
      }
    })

    return {
      key: fileName,
      signature
    }
  })
}

type UploadFileChunkParams = {
  bucket: string
  chunk: Blob
  fileName: string
  size: number
  progressCallback: (progress: number) => void
}

const uploadFileChunk = async ({
  bucket,
  chunk,
  size,
  fileName,
  progressCallback
}: UploadFileChunkParams): Promise<void> => {
  progressCallback(0)
  // Get presigned S3 post url
  const { url, fields } = await api<PresignedPostResponse>(`/files?file=${fileName}`)

  // Prepare form data
  const formData = new FormData()
  Object.entries(fields).forEach(([key, value]) => {
    if (typeof value !== 'string') {
      return
    }
    formData.append(key, value)
  })
  formData.append('Content-type', 'application/octet-stream') // Setting content type a binary file.
  formData.append('file', chunk)

  // Post file to S3
  // @todo Unclear why we have to append bucket here.
  // Using axios b/c of built-in progress callback
  await axios.request({
    method: 'POST',
    url: `${url}/${bucket}`,
    data: formData,
    onUploadProgress: (p) => {
      progressCallback(p.loaded / (p.total || size))
    }
  })
}

export const handleFileChunksDownload = ({
  alias,
  bucket,
  chunks,
  decryptionKey
}: Pick<SecretFile, 'alias' | 'bucket' | 'chunks' | 'decryptionKey'>) => {
  const decryptionStream = new ReadableStream({
    async start(controller) {
      // We download the chunks in sequence.
      // We could do concurrent fetching but the order of the chunks in the stream is important.
      for (const chunk of chunks) {
        const key = chunk.key
        const signature = chunk.signature
        const keyHash = await createHash(key)

        const { url } = await api<SignedUrlGetResponse>(
          `/files/${key}`,
          { method: 'POST' },
          { alias, bucket, keyHash, signature }
        )
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Couldn't retrieve file - it may no longer exist.`)
        }

        const encryptedFileChunk = await response.blob()
        const decryptedFileChunk = await decryptData(encryptedFileChunk, decryptionKey)

        controller.enqueue(new Uint8Array(decryptedFileChunk))
      }

      controller.close()
    }
  })

  return decryptionStream
}
