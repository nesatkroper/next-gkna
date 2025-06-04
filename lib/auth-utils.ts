import Cookies from 'js-cookie'
import CryptoJS from 'crypto-js'

// Set a secret key for encryption (should be in environment variables)
const SECRET_KEY = process.env.NEXT_PUBLIC_COOKIE_SECRET || 'your-secret-key-here'

/**
 * Encrypts and stores authentication data in a cookie
 * @param data The auth data to store
 * @param expiresInDays Cookie expiration in days (default: 7)
 */
export function storeAuthData(data: any, expiresInDays: number = 7) {
  try {
    // Convert data to string and encrypt
    const dataString = JSON.stringify(data)
    const encryptedData = CryptoJS.AES.encrypt(dataString, SECRET_KEY).toString()
    
    // Set cookie with encrypted data
    Cookies.set('auth-data', encryptedData, {
      expires: expiresInDays,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })
  } catch (error) {
    console.error('Error storing auth data:', error)
  }
}

/**
 * Retrieves and decrypts authentication data from cookie
 * @returns Decrypted auth data or null if not found/invalid
 */
export function getAuthData(): any | null {
  try {
    const encryptedData = Cookies.get('auth-data')
    if (!encryptedData) return null
    
    // Decrypt the data
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY)
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8)
    
    // Parse and return the data
    return JSON.parse(decryptedData)
  } catch (error) {
    console.error('Error retrieving auth data:', error)
    return null
  }
}

/**
 * Clears the authentication data cookie
 */
export function clearAuthData() {
  Cookies.remove('auth-data', { path: '/' })
}