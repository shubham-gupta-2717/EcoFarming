const { getDistance } = require('geolib');
const { db } = require('../config/firebase');

/**
 * Calculate distance between two GPS coordinates in kilometers
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    try {
        const distanceInMeters = getDistance(
            { latitude: lat1, longitude: lon1 },
            { latitude: lat2, longitude: lon2 }
        );
        return distanceInMeters / 1000; // Convert to kilometers
    } catch (error) {
        console.error('❌ Error calculating distance:', error);
        return 0;
    }
}

/**
 * Verify photo was taken at farmer's registered farm location
 * Prevents uploading photos from other farms (someone else's farming activity)
 * @param {Object} imageMetadata - Image metadata with GPS data
 * @param {string} userId - Farmer's user ID
 * @returns {Promise<Object>} Verification result
 */
async function verifyPhotoLocation(imageMetadata, userId) {
    try {
        // Get farmer's registered farm location
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return {
                verified: true,
                warning: 'User not found',
                suspicionLevel: 'none'
            };
        }

        const userData = userDoc.data();
        const farmLocation = userData.farmLocation || userData.location;

        // If no farm location registered, allow but warn
        if (!farmLocation || (!farmLocation.lat && !farmLocation.latitude)) {
            console.warn(`⚠️ No farm location registered for user ${userId}`);
            return {
                verified: true,
                warning: 'No farm location registered',
                suspicionLevel: 'none'
            };
        }

        // Extract GPS from image
        const photoGPS = imageMetadata.gps;

        // If no GPS in image, flag as suspicious (possible downloaded photo)
        if (!photoGPS || (!photoGPS.lat && !photoGPS.latitude)) {
            console.warn(`⚠️ No GPS data in image for user ${userId}`);
            return {
                verified: false,
                reason: 'No GPS data in image - possible downloaded or stock photo',
                suspicionLevel: 'medium',
                fraudIndicator: 'MISSING_GPS'
            };
        }

        // Normalize coordinates (handle both lat/lon and latitude/longitude)
        const photoLat = photoGPS.lat || photoGPS.latitude;
        const photoLon = photoGPS.lon || photoGPS.longitude;
        const farmLat = farmLocation.lat || farmLocation.latitude;
        const farmLon = farmLocation.lon || farmLocation.longitude;

        // Calculate distance between photo location and farm
        const distance = calculateDistance(photoLat, photoLon, farmLat, farmLon);

        console.log(`📍 Photo location check for user ${userId}: ${distance.toFixed(2)}km from farm`);

        // Flag if photo taken more than 5km from registered farm
        const MAX_DISTANCE_KM = 5;

        if (distance > MAX_DISTANCE_KM) {
            return {
                verified: false,
                reason: `Photo taken ${distance.toFixed(1)}km from registered farm - possible other person's farming activity`,
                suspicionLevel: 'high',
                distance: distance.toFixed(2),
                fraudIndicator: 'WRONG_LOCATION',
                photoLocation: { lat: photoLat, lon: photoLon },
                farmLocation: { lat: farmLat, lon: farmLon }
            };
        }

        // Photo is within acceptable range
        return {
            verified: true,
            distance: distance.toFixed(2),
            suspicionLevel: 'none'
        };

    } catch (error) {
        console.error('❌ Error verifying photo location:', error);
        // Don't block on error, but log it
        return {
            verified: true,
            warning: 'Location verification failed',
            error: error.message,
            suspicionLevel: 'none'
        };
    }
}

/**
 * Parse location string to coordinates
 * Handles formats like "Delhi, India" or "28.6139,77.2090"
 * @param {string|Object} location - Location string or object
 * @returns {Promise<Object>} Coordinates {lat, lon}
 */
async function parseLocation(location) {
    if (typeof location === 'object' && (location.lat || location.latitude)) {
        return {
            lat: location.lat || location.latitude,
            lon: location.lon || location.longitude
        };
    }

    // If it's a string with coordinates
    if (typeof location === 'string' && location.includes(',')) {
        const [lat, lon] = location.split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(lat) && !isNaN(lon)) {
            return { lat, lon };
        }
    }

    // Default: return null if can't parse
    return null;
}

module.exports = {
    verifyPhotoLocation,
    calculateDistance,
    parseLocation
};
