import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_OFFLINE_SECRET_KEY || 'eco-farming-offline-secret-v1';

/**
 * Encrypt data before storing offline (Prevent XSS/Local reading)
 * @param {Object|String} data 
 * @returns {String} Encrypted string
 */
export const encryptPayload = (data) => {
    try {
        const jsonString = JSON.stringify(data);
        return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    } catch (error) {
        console.error("Encryption Failed:", error);
        return null;
    }
};

/**
 * Decrypt data after retrieving from offline storage
 * @param {String} encryptedString 
 * @returns {Object|String} Decrypted data
 */
export const decryptPayload = (encryptedString) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedString, SECRET_KEY);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedString);
    } catch (error) {
        console.error("Decryption Failed:", error);
        return null;
    }
};

/**
 * Generate a simple hash for conflict detection
 * @param {Object} data 
 * @returns {String}
 */
export const generateParamsHash = (data) => {
    return CryptoJS.SHA256(JSON.stringify(data)).toString();
};
