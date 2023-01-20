import { encryptString, encryptFile } from '$lib/crypto'
import { api, asyncPool } from '$lib/api'

type PresignedPostResponse = { url: string; fields: Record<string, string> }

export interface FileMeta {
  bucket: string
  chunkFileNames: [string]
  numberOfChunks?: number
}

export interface SecretFile extends FileMeta, Pick<File, 'name' | 'size' | 'type'> {
  message?: string
  isEncryptedWithUserPassword?: boolean // TBD
  receipt?: Record<string, unknown> // TBD
}

export const MB = 10 ** 6 // 1000000 Bytes = 1 MB.
export const GB = 10 ** 9 // 1000000000 Bytes = 1 GB.

export const encryptFileReference = async (file: File, meta: FileMeta, encryptionKey: string) => {
  const { name, size, type } = file
  const fileReference = {
    ...meta,
    name,
    size,
    type
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
}: HandleFileEncryptionAndUpload): Promise<Pick<FileMeta, 'numberOfChunks' | 'chunkFileNames'>> => {
  const chunkSize = 10 * MB // @todo increase this
  const fileSize = file.size
  const numberOfChunks = typeof chunkSize === 'number' ? Math.ceil(fileSize / chunkSize) : 1
  const concurrentUploads = Math.min(3, numberOfChunks)
  let d = 0
  progressCallback(0)

  const chunkFileNames = await asyncPool(
    concurrentUploads,
    [...new Array(numberOfChunks).keys()],
    async (i) => {
      const start = i * chunkSize
      const end = i + 1 === numberOfChunks ? fileSize : (i + 1) * chunkSize
      const chunk = file.slice(start, end)

      const encryptedFile = await encryptFile(chunk, encryptionKey)

      // Adding the chunk index to the filename
      const chunkFileName = `${fileName}-${i}`

      return await uploadFileChunk({
        chunk: encryptedFile,
        chunkIndex: i,
        bucket,
        fileName: chunkFileName
      })
        .then(() => {
          d++
          progressCallback((d * 100) / numberOfChunks)
        })
        .then(() => chunkFileName)
    }
  )

  return {
    chunkFileNames,
    numberOfChunks
  }
}

type UploadFileChunk = ({ chunk: Blob, bucket: string, fileName: string }) => Promise<void>
const uploadFileChunk: UploadFileChunk = async ({ chunk, bucket, fileName }) => {
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
