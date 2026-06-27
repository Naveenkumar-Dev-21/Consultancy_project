import crypto from 'crypto';

// Algorithm for encryption
const ALGORITHM = 'aes-256-cbc';

/**
 * Derives a key from the encryption key stored in environment variables
 * @returns {Buffer} - 32-byte key for AES-256
 */
const getKey = () => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY is not defined in environment variables');
    }
    // Create a 32-byte key from the environment variable
    return crypto.createHash('sha256').update(key).digest();
};

/**
 * Encrypts a string (image URL or base64 data)
 * @param {string} text - The text to encrypt
 * @returns {string} - Encrypted text in format: iv:encryptedData
 */
export const encrypt = (text) => {
    if (!text) return text;
    
    try {
        const key = getKey();
        // Generate a random initialization vector
        const iv = crypto.randomBytes(16);
        
        // Create cipher
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        // Encrypt the text
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        // Return IV and encrypted data combined (we need IV for decryption)
        return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

/**
 * Decrypts an encrypted string
 * @param {string} encryptedText - The encrypted text in format: iv:encryptedData
 * @returns {string} - Decrypted original text
 */
export const decrypt = (encryptedText) => {
    if (!encryptedText) return encryptedText;
    
    try {
        // Check if the text looks like it's encrypted
        // Encrypted format: 32 hex chars (IV) : hex encrypted data
        // Example: a1b2c3d4e5f6...1234:9f8e7d6c5b4a...5678
        if (!encryptedText.includes(':')) {
            // Not encrypted, return as is
            return encryptedText;
        }
        
        const parts = encryptedText.split(':');
        
        // If it doesn't have exactly 2 parts, it's likely a URL (e.g., http://... or https://...)
        // Encrypted data should have exactly one colon separator
        if (parts.length !== 2) {
            return encryptedText;
        }
        
        const ivHex = parts[0];
        const encryptedDataHex = parts[1];
        
        // Check if the first part looks like a hex IV (32 hex characters = 16 bytes)
        // and the second part looks like hex encrypted data
        const hexPattern = /^[0-9a-fA-F]+$/;
        if (ivHex.length !== 32 || !hexPattern.test(ivHex) || !hexPattern.test(encryptedDataHex)) {
            // Doesn't match encrypted format, return as is (likely a URL or plain text)
            return encryptedText;
        }
        
        const key = getKey();
        
        // Convert hex to buffer
        const iv = Buffer.from(ivHex, 'hex');
        
        // Create decipher
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        
        // Decrypt the data
        let decrypted = decipher.update(encryptedDataHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        // Return original text if decryption fails (for backward compatibility)
        return encryptedText;
    }
};
