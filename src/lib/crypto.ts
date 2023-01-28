const encodeText = (text: string) => {
  const encoder = new TextEncoder()
  return encoder.encode(text)
}

const decodeText = (data: ArrayBuffer) => {
  const decoder = new TextDecoder()
  return decoder.decode(data)
}

const binaryToBase64 = (arrayBuffer: ArrayBuffer) =>
  window.btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

const base64ToBinary = (base64: string) => {
  const base64Decoded = window.atob(base64)
  const uint8Array = Uint8Array.from(base64Decoded, (c) => c.charCodeAt(0))

  return uint8Array.buffer
}

const exportRawKey = async (key: CryptoKey) => {
  const exportedKey = await crypto.subtle.exportKey('raw', key)
  return binaryToBase64(exportedKey)
}

const importRawKey = async (base64: string) => {
  const rawKey = base64ToBinary(base64)

  const importedKey = await crypto.subtle.importKey(
    'raw',
    rawKey,
    {
      name: 'ECDSA',
      namedCurve: 'P-384'
    },
    true,
    ['sign', 'verify']
  )
  return importedKey
}

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

export const createHash = async (message: string) => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message))
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2))
    .join('')
}

export const encryptData = async (data: ArrayBuffer, masterKey: string) => {
  const iv = crypto.getRandomValues(new Uint8Array(16)) // Initialization Vector (IV)
  const cryptoKey = await importMasterKey(masterKey)
  const result = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, data)

  const encryptedFile = new Blob([iv, result]) // Adding IV
  return encryptedFile
}

export const decryptData = async (data: Blob, masterKey: string) => {
  const key = await importMasterKey(masterKey)

  const [iv, body] = await Promise.all([
    data.slice(0, 16).arrayBuffer(), // Extracting IV
    data.slice(16).arrayBuffer() // The actual body. e.g. file content
  ])

  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    body
  )
  return decryptedData
}

// Here we generate an AES-GCM master key for symmetric encryption and export as string
export const generateMasterKey = async () => {
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  )
  const exportedKey = await crypto.subtle.exportKey('jwk', key)

  if (!exportedKey.k) {
    throw Error('Failed to generate encryption key.')
  }

  return exportedKey.k
}
// Import AES-GCM master key that is stored as string
const importMasterKey = async (key: string) =>
  await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'oct',
      k: key, // The encryption key
      alg: 'A256GCM',
      ext: true
    },
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  )

export const encryptFile = async (file: File | Blob, masterKey: string) => {
  const data = await file.arrayBuffer()

  return encryptData(data, masterKey)
}

// Not in use. Could be used to decrypt smaller files at once.
export const decryptFile = async (file: Blob, masterKey: string, fileName: string) => {
  const decryptedData = await decryptData(file, masterKey)

  return new File([decryptedData], fileName)
}

export const encryptString = async (text: string, masterKey: string) => {
  const data = encodeText(text)

  const encryptedData = await encryptData(data, masterKey)

  const encryptedDataBase64 = await blobToBase64(encryptedData)
  return encryptedDataBase64
}

export const decryptString = async (base64DataUrl: string, masterKey: string) => {
  const base64Response = await fetch(base64DataUrl)
  const blob = await base64Response.blob()

  const decryptedData = await decryptData(blob, masterKey)

  const result = decodeText(decryptedData)

  return result
}

// Digital signature

// Generate public/private key pair
export const generateKeyPair = async () =>
  crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-384'
    },
    true,
    ['sign', 'verify']
  )

// Create a signature using the private key
export const signMessage = async (privateKey: CryptoKey, message: string) => {
  const encoded = encodeText(message)
  const signature = await window.crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-384' }
    },
    privateKey,
    encoded
  )
  const signatureAsBase64 = binaryToBase64(signature)
  return signatureAsBase64
}

// Verify messsage signature
export const verifyMessage = async (
  message: string,
  signature: ArrayBuffer,
  publicKey: CryptoKey
) => {
  const encoded = encodeText(message)

  const result = await window.crypto.subtle.verify(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-384' }
    },
    publicKey,
    signature,
    encoded
  )

  return result
}
