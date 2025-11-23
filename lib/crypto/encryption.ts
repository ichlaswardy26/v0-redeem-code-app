import nacl from "tweetnacl"
import { encode as encodeBase64, decode as decodeBase64 } from "js-base64"

// Generate a random nonce (24 bytes)
export function generateNonce(): Uint8Array {
  return nacl.randomBytes(24)
}

// Encrypt text using tweetnacl secretbox
export function encryptRedeemedCode(text: string, secretKey: Uint8Array): string {
  const nonce = generateNonce()
  const message = new TextEncoder().encode(text)
  const encrypted = nacl.secretbox(message, nonce, secretKey)

  // Combine nonce + ciphertext and encode to base64
  const combined = new Uint8Array(nonce.length + encrypted.length)
  combined.set(nonce)
  combined.set(encrypted, nonce.length)

  return encodeBase64(combined)
}

// Decrypt text using tweetnacl secretbox
export function decryptRedeemedCode(encrypted: string, secretKey: Uint8Array): string {
  const combined = decodeBase64(encrypted)
  const nonce = combined.slice(0, 24)
  const ciphertext = combined.slice(24)

  const decrypted = nacl.secretbox.open(new Uint8Array(ciphertext), new Uint8Array(nonce), secretKey)

  if (!decrypted) throw new Error("Decryption failed")

  return new TextDecoder().decode(decrypted)
}

// Generate encryption key (32 bytes for secretbox)
export function generateEncryptionKey(): Uint8Array {
  return nacl.randomBytes(32)
}

// Derive key from password using PBKDF2 for consistent decryption
export async function deriveKeyFromPassword(password: string, salt: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const saltBuffer = encoder.encode(salt)

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    await crypto.subtle.importKey("raw", data, "PBKDF2", false, ["deriveKey"]),
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  )

  // Export the derived key as raw bytes
  const keyData = await crypto.subtle.exportKey("raw", key)
  return new Uint8Array(keyData)
}
