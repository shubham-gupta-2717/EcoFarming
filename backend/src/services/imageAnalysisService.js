const sharp = require('sharp');
const crypto = require('crypto');
const ExifParser = require('exif-parser');
const axios = require('axios');

/**
 * Extract EXIF metadata from image buffer
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {Object} Metadata including camera, timestamp, GPS
 */
async function extractImageMetadata(imageBuffer) {
    try {
        const parser = ExifParser.create(imageBuffer);
        const result = parser.parse();

        return {
            camera: result.tags?.Model || null,
            make: result.tags?.Make || null,
            timestamp: result.tags?.DateTimeOriginal
                ? new Date(result.tags.DateTimeOriginal * 1000)
                : null,
            gps: result.tags?.GPSLatitude && result.tags?.GPSLongitude
                ? {
                    lat: result.tags.GPSLatitude,
                    lon: result.tags.GPSLongitude
                }
                : null,
            software: result.tags?.Software || null,
            orientation: result.tags?.Orientation || null,
            hasMetadata: !!result.tags
        };
    } catch (error) {
        console.warn('⚠️ Failed to extract EXIF metadata:', error.message);
        return {
            camera: null,
            make: null,
            timestamp: null,
            gps: null,
            software: null,
            orientation: null,
            hasMetadata: false
        };
    }
}

/**
 * Generate perceptual hash for duplicate detection
 * Uses a combination of image content hash and visual features
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {Promise<string>} Perceptual hash
 */
async function generateImageHash(imageBuffer) {
    try {
        // Resize image to small size for perceptual hashing
        const resized = await sharp(imageBuffer)
            .resize(8, 8, { fit: 'fill' })
            .greyscale()
            .raw()
            .toBuffer();

        // Create hash from pixel data
        const hash = crypto.createHash('sha256').update(resized).digest('hex');

        return hash.substring(0, 32); // Return first 32 characters
    } catch (error) {
        console.error('❌ Error generating image hash:', error);
        // Fallback to simple content hash
        return crypto.createHash('md5').update(imageBuffer).digest('hex');
    }
}

/**
 * Verify image was taken recently (within last 48 hours)
 * @param {Object} metadata - Image metadata from extractImageMetadata
 * @param {Date} submissionTime - Time of submission
 * @returns {boolean} True if image is fresh
 */
function verifyImageFreshness(metadata, submissionTime) {
    if (!metadata.timestamp) {
        // No timestamp in metadata - could be suspicious but not conclusive
        console.warn('⚠️ Image has no timestamp metadata');
        return true; // Allow but flag for review
    }

    const imageTime = new Date(metadata.timestamp);
    const timeDiff = submissionTime - imageTime;
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Allow images taken within last 48 hours
    const isFresh = hoursDiff >= 0 && hoursDiff <= 48;

    if (!isFresh) {
        console.log(`⚠️ Image is ${hoursDiff.toFixed(1)} hours old`);
    }

    return isFresh;
}

/**
 * Check image quality and detect potential stock photos
 * @param {Buffer} imageBuffer - Image file buffer
 * @returns {Promise<Object>} Quality metrics
 */
async function checkImageQuality(imageBuffer) {
    try {
        const image = sharp(imageBuffer);
        const metadata = await image.metadata();
        const stats = await image.stats();

        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format,
            size: imageBuffer.length,
            // High resolution might indicate stock photo
            isHighResolution: metadata.width > 3000 || metadata.height > 3000,
            // Very small size might indicate downloaded/compressed image
            isLowQuality: imageBuffer.length < 50000, // Less than 50KB
            // Check if image has been heavily edited (high sharpness)
            channels: metadata.channels,
            hasAlpha: metadata.hasAlpha,
            aspectRatio: (metadata.width / metadata.height).toFixed(2)
        };
    } catch (error) {
        console.error('❌ Error checking image quality:', error);
        return {
            width: 0,
            height: 0,
            format: 'unknown',
            size: 0,
            isHighResolution: false,
            isLowQuality: false,
            channels: 0,
            hasAlpha: false,
            aspectRatio: '0'
        };
    }
}

/**
 * Detect if image appears to be a stock photo or professional image
 * Uses image quality metrics and metadata
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {Object} metadata - EXIF metadata
 * @returns {Object} Stock photo indicators
 */
async function detectStockPhoto(imageBuffer, metadata) {
    const quality = await checkImageQuality(imageBuffer);

    const indicators = {
        highResolution: quality.isHighResolution,
        noMetadata: !metadata.hasMetadata,
        professionalCamera: metadata.camera && (
            metadata.camera.includes('Canon') ||
            metadata.camera.includes('Nikon') ||
            metadata.camera.includes('Sony Alpha')
        ),
        editingSoftware: metadata.software && (
            metadata.software.includes('Photoshop') ||
            metadata.software.includes('Lightroom') ||
            metadata.software.includes('GIMP')
        ),
        perfectAspectRatio: ['1.33', '1.50', '1.78'].includes(quality.aspectRatio) // Common stock photo ratios
    };

    const suspicionScore = Object.values(indicators).filter(Boolean).length;

    return {
        ...indicators,
        isLikelyStockPhoto: suspicionScore >= 3,
        suspicionScore
    };
}

/**
 * Comprehensive image analysis for fraud detection
 * @param {Buffer} imageBuffer - Image file buffer
 * @param {Date} submissionTime - Time of submission
 * @returns {Promise<Object>} Complete analysis results
 */
async function analyzeImage(imageBuffer, submissionTime) {
    try {
        const [metadata, imageHash, quality] = await Promise.all([
            extractImageMetadata(imageBuffer),
            generateImageHash(imageBuffer),
            checkImageQuality(imageBuffer)
        ]);

        const stockPhotoIndicators = await detectStockPhoto(imageBuffer, metadata);
        const isFresh = verifyImageFreshness(metadata, submissionTime);

        return {
            metadata,
            imageHash,
            quality,
            stockPhotoIndicators,
            isFresh,
            fraudRiskScore: calculateImageFraudRisk({
                metadata,
                quality,
                stockPhotoIndicators,
                isFresh
            })
        };
    } catch (error) {
        console.error('❌ Error analyzing image:', error);
        throw error;
    }
}

/**
 * Calculate fraud risk score based on image analysis
 * @param {Object} analysis - Image analysis results
 * @returns {number} Fraud risk score (0-100)
 */
function calculateImageFraudRisk({ metadata, quality, stockPhotoIndicators, isFresh }) {
    let score = 0;

    // No metadata (30 points)
    if (!metadata.hasMetadata) score += 30;

    // Not fresh (20 points)
    if (!isFresh) score += 20;

    // Stock photo indicators (25 points)
    if (stockPhotoIndicators.isLikelyStockPhoto) score += 25;

    // High resolution professional image (15 points)
    if (quality.isHighResolution) score += 15;

    // Editing software detected (10 points)
    if (stockPhotoIndicators.editingSoftware) score += 10;

    return Math.min(score, 100);
}

module.exports = {
    extractImageMetadata,
    generateImageHash,
    verifyImageFreshness,
    checkImageQuality,
    detectStockPhoto,
    analyzeImage,
    calculateImageFraudRisk
};
