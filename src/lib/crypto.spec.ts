import { describe, test, expect, expectTypeOf } from 'vitest'

import {
  generateKeyPair,
  importPublicKey,
  exportPublicKey,
  encodeText,
  decodeText,
  signMessage,
  verifyMessageSignature,
  binaryToBase64,
  base64ToBinary
} from './crypto'

const key = await crypto.subtle.generateKey(
  {
    name: 'AES-GCM',
    length: 256
  },
  true,
  ['encrypt', 'decrypt']
)
const iv = crypto.getRandomValues(new Uint8Array(16)) // Initialization Vector (IV)
const keyPair = await generateKeyPair()

describe('Crypto', () => {
  test('Create public/private key pair', async () => {
    expectTypeOf(keyPair.publicKey).toMatchTypeOf<CryptoKey>()
  })

  test('Message signature using public/private key pair', async () => {
    const message = 'Some random text'

    // Sign signature with private key
    const signature = await signMessage(message, keyPair.privateKey)

    // Verify signature using public key
    const verifiedMessageWithPublicKey = await verifyMessageSignature(
      message,
      signature,
      keyPair.publicKey
    )

    expect(verifiedMessageWithPublicKey).equal(true)
  })

  test('Binary to Base64 to Binary', async () => {
    const randomBinary = crypto.getRandomValues(new Uint8Array(16))

    const base64 = binaryToBase64(randomBinary)
    const binaryKey = base64ToBinary(base64)

    function equalBuffer(buf1: ArrayBuffer, buf2: ArrayBuffer) {
      if (buf1.byteLength != buf2.byteLength) {
        return false
      }
      const dv1 = new Int8Array(buf1)
      const dv2 = new Int8Array(buf2)
      for (let i = 0; i != buf1.byteLength; i++) {
        if (dv1[i] != dv2[i]) return false
      }
      return true
    }

    expect(equalBuffer(randomBinary, binaryKey)).toBe(true)
  })

  test('Test imported key', async () => {
    const originalMessage = 'This is a secret'
    const encryptedMessage = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodeText(originalMessage)
    )

    const exportRawKey = await crypto.subtle.exportKey('raw', key)
    const base64 = binaryToBase64(exportRawKey)
    const binaryKey = base64ToBinary(base64)

    const extractedKey = await crypto.subtle.importKey('raw', binaryKey, 'AES-GCM', true, [
      'encrypt',
      'decrypt'
    ])

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encryptedMessage
    )

    const decryptedMessage = decodeText(decrypted)

    expectTypeOf(extractedKey).toMatchTypeOf<CryptoKey>()

    expect(originalMessage).equal(decryptedMessage)
  })

  test('Import/export public key', async () => {
    const exportedPublicKey = await exportPublicKey(keyPair.publicKey)
    const importedKey = await importPublicKey(exportedPublicKey)

    expectTypeOf(importedKey).toMatchTypeOf<CryptoKey>()
  })

  test('Test signature with exported public key', async () => {
    const message = 'Some random text'
    const exportedPublicKey = await exportPublicKey(keyPair.publicKey)

    // Sign signature with private key
    const signature = await signMessage(message, keyPair.privateKey)

    const importedKey = await importPublicKey(exportedPublicKey)

    // Verify signature using public key
    const verifiedMessageWithPublicKey = await verifyMessageSignature(
      message,
      signature,
      importedKey
    )

    expect(verifiedMessageWithPublicKey).equal(true)
  })
})
