import axios from 'axios'

import { encryptFile, decryptData, createHash, signMessage } from '$lib/crypto'
import { api, asyncPool } from '$lib/api'
type SignedUrlGetResponse = {
  url: string
}
type PresignedPostResponse = { url: string; fields: Record<string, string> }

export interface FileMeta {
  uuid: string
  bucket: string
  numberOfChunks: number
  mimeType?: string
}

export interface SecretFile extends FileMeta, Pick<File, 'name' | 'size'> {
  decryptionKey: string
  message?: string
  isEncryptedWithUserPassword?: boolean // TBD
  receipt?: Record<string, unknown> // TBD
}

export const MB = 10 ** 6 // 1000000 Bytes = 1 MB.
export const GB = 10 ** 9 // 1000000000 Bytes = 1 GB.

const chunkSize = 1 * MB // @todo increase this

type HandleFileEncryptionAndUpload = {
  file: File
  bucket: string
  masterKey: string
  privateKey: CryptoKey
  progressCallback: (progress: number) => void
}

type Chunk = {
  key: string
  signature: string
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
  let numberOfChunksUploaded = 0
  progressCallback(0)

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
        const totalProgress = (numberOfChunksUploaded * 100) / numberOfChunks + p / numberOfChunks
        progressCallback(totalProgress)
      }
    })
    numberOfChunksUploaded++

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
  uuid,
  numberOfChunks,
  decryptionKey
}: Pick<SecretFile, 'uuid' | 'numberOfChunks' | 'decryptionKey'>) => {
  const decryptionStream = new ReadableStream({
    async start(controller) {
      // We download the chunks in sequence.
      // We could do concurrent fetching but the order of the chunks in the stream is important.
      let i = 0
      while (i < numberOfChunks) {
        const key = `${uuid}-${i}`
        const { url } = await api<SignedUrlGetResponse>(`/files/${key}`, { method: 'GET' })
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Couldn't retrieve file - it may no longer exist.`)
        }

        const encryptedFileChunk = await response.blob()
        const decryptedFileChunk = await decryptData(encryptedFileChunk, decryptionKey)

        controller.enqueue(new Uint8Array(decryptedFileChunk))
        i++
      }

      controller.close()
    }
  })

  return decryptionStream
}
