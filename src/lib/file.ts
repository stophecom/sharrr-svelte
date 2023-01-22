import { encryptString, encryptFile, decryptData } from '$lib/crypto'
import { api, asyncPool } from '$lib/api'

type SignedUrlGetResponse = {
  url: string
}
type PresignedPostResponse = { url: string; fields: Record<string, string> }

export interface FileMeta {
  uuid: string
  bucket: string
  chunkFileNames: string[]
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

export const encryptFileReference = async (file: File, meta: FileMeta, encryptionKey: string) => {
  const { name, size, type } = file
  const fileReference = {
    ...meta,
    name,
    size,
    mimeType: type
  }

  return await encryptString(JSON.stringify(fileReference), encryptionKey)
}

type HandleFileEncryptionAndUpload = {
  file: File
  bucket: string
  fileName: string
  encryptionKey: string
  progressCallback: (progress: number) => void
}

export const handleFileEncryptionAndUpload = async ({
  file,
  bucket,
  fileName,
  encryptionKey,
  progressCallback
}: HandleFileEncryptionAndUpload): Promise<
  Pick<FileMeta, 'numberOfChunks' | 'chunkFileNames' | 'uuid'>
> => {
  const fileSize = file.size
  const numberOfChunks = typeof chunkSize === 'number' ? Math.ceil(fileSize / chunkSize) : 1
  const concurrentUploads = Math.min(3, numberOfChunks)
  let d = 0
  progressCallback(0)

  const chunkFileNames = await asyncPool(
    concurrentUploads,
    [...new Array(numberOfChunks).keys()],
    async (i: number) => {
      const start = i * chunkSize
      const end = i + 1 === numberOfChunks ? fileSize : (i + 1) * chunkSize
      const chunk = file.slice(start, end)

      const encryptedFile = await encryptFile(chunk, encryptionKey)

      // Adding the chunk index to the filename
      const chunkFileName = `${fileName}-${i}`

      await uploadFileChunk({
        chunk: encryptedFile,
        bucket,
        fileName: chunkFileName
      }).then(() => {
        d++
        progressCallback((d * 100) / numberOfChunks)
      })

      return chunkFileName
    }
  )

  return {
    uuid: fileName,
    chunkFileNames,
    numberOfChunks
  }
}

type UploadFileChunkParams = { chunk: Blob; bucket: string; fileName: string }

const uploadFileChunk = async ({
  chunk,
  bucket,
  fileName
}: UploadFileChunkParams): Promise<void> => {
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

  // @todo
  // Post file to S3
  // Unclear why we have to append bucket here.
  await fetch(`${url}/${bucket}`, {
    method: 'POST',
    body: formData
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
