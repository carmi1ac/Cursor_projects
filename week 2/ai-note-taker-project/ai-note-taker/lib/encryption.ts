import CryptoJS from "crypto-js"

// Generate a key from the user's ID (for backward compatibility)
function getEncryptionKey(userId: string): string {
  return CryptoJS.SHA256(userId + process.env.NEXT_PUBLIC_ENCRYPTION_SALT || "default-salt").toString()
}

// Generate a key from password
function getPasswordKey(password: string, userId: string): string {
  // Combine password with user ID for additional security
  return CryptoJS.PBKDF2(password, userId, {
    keySize: 256 / 32,
    iterations: 1000,
  }).toString()
}

export function encryptContent(content: string, userId: string, password?: string): string {
  const key = password 
    ? getPasswordKey(password, userId)
    : getEncryptionKey(userId)
  const encrypted = CryptoJS.AES.encrypt(content, key).toString()
  return encrypted
}

export function decryptContent(encryptedContent: string, userId: string, password?: string): string {
  try {
    const key = password
      ? getPasswordKey(password, userId)
      : getEncryptionKey(userId)
    const decrypted = CryptoJS.AES.decrypt(encryptedContent, key)
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8)
    
    if (!decryptedText) {
      throw new Error("Failed to decrypt content. Incorrect password or corrupted data.")
    }
    
    return decryptedText
  } catch (error) {
    throw new Error("Failed to decrypt content. Incorrect password or corrupted data.")
  }
}

