import { encryptString } from '$lib/crypto'

export interface FileMeta {
  someRefKey: string
  bucket?: string
  message?: string
  isEncryptedWithUserPassword?: boolean // TBD
  receipt?: Record<string, unknown> // TBD
}

export interface SecretFile extends FileMeta, Pick<File, 'name' | 'size' | 'type'> {
  bucket?: string
  someRefKey: string
  message?: string
  isEncryptedWithUserPassword: boolean // TBD
  receipt?: Record<string, unknown> // TBD
}

export const encryptFileMetaData = async (file: File, meta: FileMeta, encryptionKey: string) => {
  const { name, size, type } = file
  const fileMeta = {
    ...meta,
    name,
    size,
    type
  }

  return await encryptString(JSON.stringify(fileMeta), encryptionKey)
}
