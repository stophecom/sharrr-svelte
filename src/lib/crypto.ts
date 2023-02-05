export const arrayBufferToString = (buffer: ArrayBuffer) =>
  String.fromCharCode(...new Uint8Array(buffer))

export const stringToArrayBuffer = (str: string) => {
  const uint8Array = Uint8Array.from(str, (c) => c.charCodeAt(0))
  return uint8Array.buffer
}

export const encodeText = (text: string) => {
  const encoder = new TextEncoder()
  return encoder.encode(text)
}

export const decodeText = (data: ArrayBuffer) => {
  const decoder = new TextDecoder()
  return decoder.decode(data)
}

export const binaryToBase64 = (arrayBuffer: ArrayBuffer) => {
  return btoa(arrayBufferToString(arrayBuffer))
}

export const base64ToBinary = (base64: string) => {
  const base64Decoded = atob(base64)

  return stringToArrayBuffer(base64Decoded)
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

// Initialization Vector (IV)
const createIv = () => crypto.getRandomValues(new Uint8Array(16))

export const createIvAsString = () => {
  const iv = createIv()
  return binaryToBase64(iv.buffer)
}

export const createHash = async (message: string) => {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(message))
  return Array.prototype.map
    .call(new Uint8Array(buffer), (x) => ('00' + x.toString(16)).slice(-2))
    .join('')
}

export const encryptData = async (data: ArrayBuffer, masterKey: string) => {
  const iv = createIv()
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

// Used to encrypt the alias. The IV is stored separately.
export const encryptAndHash = async (message: string, ivAsString: string, masterKey: string) => {
  const data = encodeText(message)
  const iv = base64ToBinary(ivAsString)
  const cryptoKey = await importMasterKey(masterKey)
  const result = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, data)
  const decoded = decodeText(result)

  return await createHash(decoded)
}

// Digital signature
// Generate public/private key pair
export const generateKeyPair = async () =>
  await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-384'
    },
    true,
    ['sign', 'verify']
  )

// Export (public) key as PEM
const pemHeader = '-----BEGIN PUBLIC KEY-----'
const pemFooter = '-----END PUBLIC KEY-----'

export const exportPublicKey = async (key: CryptoKey) => {
  const exported = await crypto.subtle.exportKey('spki', key)
  const exportedAsBase64 = binaryToBase64(exported)
  const pemExported = `${pemHeader}\n${exportedAsBase64}\n${pemFooter}`

  return pemExported
}

export const importPublicKey = (pem: string) => {
  // fetch the part of the PEM string between header and footer
  const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length)

  const binaryKey = base64ToBinary(pemContents)

  return crypto.subtle.importKey(
    'spki',
    binaryKey,
    {
      name: 'ECDSA',
      namedCurve: 'P-384'
    },
    true,
    ['verify']
  )
}

// Create a signature using the private key
export const signMessage = async (message: string, privateKey: CryptoKey) => {
  const encoded = encodeText(message)
  const signature = await crypto.subtle.sign(
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
export const verifyMessageSignature = async (
  message: string,
  signature: string,
  publicKey: CryptoKey
) => {
  const encoded = encodeText(message)
  const signatureDecoded = base64ToBinary(signature)

  const result = await crypto.subtle.verify(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-384' }
    },
    publicKey,
    signatureDecoded,
    encoded
  )

  return result
}
