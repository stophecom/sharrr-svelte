const blobToBase64 = async (blob: Blob) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject('Failed to create base64 from blob.')
      }
    }
    reader.readAsDataURL(blob)
  })
}

const importKeyFromString = async (key: string) =>
  await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'oct',
      k: key, // The encryption key
      alg: 'A256GCM',
      ext: true,
    },
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt'],
  )

const encryptData = async (data: ArrayBuffer, encryptionKey: string) => {
  const iv = crypto.getRandomValues(new Uint8Array(16)) // Initialization Vector (IV)
  const cryptoKey = await importKeyFromString(encryptionKey)
  const result = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, data)

  const encryptedFile = new Blob([iv, result]) // Adding IV
  return encryptedFile
}

export const decryptData = async (data: Blob, decryptionKey: string) => {
  const key = await importKeyFromString(decryptionKey)

  const [iv, body] = await Promise.all([
    data.slice(0, 16).arrayBuffer(), // Extracting IV
    data.slice(16).arrayBuffer(), // The actual body. e.g. file content
  ])

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    body,
  )
  return decryptedData
}

export const generateEncryptionKeyString = async () => {
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt'],
  )
  const exportedKey = await crypto.subtle.exportKey('jwk', key)

  if (!exportedKey.k) {
    throw Error('Failed to generate encryption key.')
  }

  return exportedKey.k
}

export const encryptFile = async (file: File, encryptionKey: string) => {
  const data = await file.arrayBuffer()

  return encryptData(data, encryptionKey)
}

export const decryptFile = async (file: Blob, decryptionKey: string, fileName: string) => {
  const decryptedData = await decryptData(file, decryptionKey)

  return new File([decryptedData], fileName)
}

export const encryptString = async (text: string, encryptionKey: string) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)

  const encryptedData = await encryptData(data, encryptionKey)

  const encryptedDataBase64 = await blobToBase64(encryptedData)
  return encryptedDataBase64
}

export const decryptString = async (base64DataUrl: string, decryptionKey: string) => {
  const base64Response = await fetch(base64DataUrl)
  const blob = await base64Response.blob()

  const decryptedData = await decryptData(blob, decryptionKey)

  const decoder = new TextDecoder()
  const result = decoder.decode(decryptedData)

  return result
}
