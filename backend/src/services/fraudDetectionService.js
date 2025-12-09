const { db, admin } = require('../config/firebase');

/**
 * Track mission submission for behavioral analysis
 * @param {string} userId - Farmer's user ID
 * @param {string} missionId - Mission ID
 * @param {string} imageHash - Perceptual hash of submitted image
 * @param {Object} metadata - Image metadata
 */
async function trackSubmission(userId, missionId, imageHash, metadata) {
    try {
        const trackingRef = db.collection('fraud_tracking').doc(userId);
        const doc = await trackingRef.get();

        const submission = {
            missionId,
            imageHash,
            timestamp: new Date(), // Use Date instead of serverTimestamp for arrays
            metadata: {
                camera: metadata.camera || 'unknown',
                hasGPS: !!metadata.gps,
                hasTimestamp: !!metadata.timestamp
            }
        };

        if (!doc.exists) {
            // Create new tracking document
            await trackingRef.set({
                userId,
                submissions: [submission],
                fraudScore: 0,
                flags: [],
                suspendedUntil: null,
                rejectionCount: 0,
                lastSubmission: admin.firestore.FieldValue.serverTimestamp(),
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Update existing tracking
            await trackingRef.update({
                submissions: admin.firestore.FieldValue.arrayUnion(submission),
                lastSubmission: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        // Also store image hash globally for cross-user duplicate detection
        await db.collection('image_hashes').add({
            hash: imageHash,
            userId,
            missionId,
            uploadedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ Tracked submission for user ${userId}`);
    } catch (error) {
        console.error('❌ Error tracking submission:', error);
        // Non-blocking error
    }
}

/**
 * Check for duplicate images (same farmer or different farmers)
 * @param {string} imageHash - Perceptual hash of image
 * @param {string} userId - Current user ID
 * @returns {Promise<boolean>} True if duplicate found
 */
async function checkDuplicateImages(imageHash, userId) {
    try {
        // Check if this exact hash exists
        const snapshot = await db.collection('image_hashes')
            .where('hash', '==', imageHash)
            .limit(1)
            .get();

        if (!snapshot.empty) {
            const existingDoc = snapshot.docs[0].data();
            console.log(`⚠️ Duplicate image detected! Previously used by user ${existingDoc.userId}`);
            return true;
        }

        return false;
    } catch (error) {
        console.error('❌ Error checking duplicates:', error);
        return false; // Don't block on error
    }
}

/**
 * Check for rapid submissions (multiple missions in short time)
 * @param {string} userId - Farmer's user ID
 * @returns {Promise<Object>} Rapid submission analysis
 */
async function checkRapidSubmissions(userId) {
    try {
        const trackingDoc = await db.collection('fraud_tracking').doc(userId).get();

        if (!trackingDoc.exists) {
            return { isRapid: false, count: 0, timeWindow: 0 };
        }

        const data = trackingDoc.data();
        const submissions = data.submissions || [];

        // Check last hour
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentSubmissions = submissions.filter(sub => {
            if (!sub.timestamp) return false;
            const subTime = sub.timestamp.toDate();
            return subTime > oneHourAgo;
        });

        // Flag if more than 5 submissions in 1 hour
        const isRapid = recentSubmissions.length > 5;

        return {
            isRapid,
            count: recentSubmissions.length,
            timeWindow: 60 // minutes
        };
    } catch (error) {
        console.error('❌ Error checking rapid submissions:', error);
        return { isRapid: false, count: 0, timeWindow: 0 };
    }
}

/**
 * Calculate fraud score for a farmer
 * @param {string} userId - Farmer's user ID
 * @returns {Promise<number>} Fraud score (0-100)
 */
async function calculateFraudScore(userId) {
    try {
        const trackingDoc = await db.collection('fraud_tracking').doc(userId).get();

        if (!trackingDoc.exists) {
            return 0;
        }

        const data = trackingDoc.data();
        const submissions = data.submissions || [];
        const rejectionCount = data.rejectionCount || 0;

        let score = 0;

        // 1. Rapid submissions (0-30 points)
        const rapidCheck = await checkRapidSubmissions(userId);
        if (rapidCheck.isRapid) {
            score += Math.min(rapidCheck.count * 5, 30);
        }

        // 2. Rejection rate (0-25 points)
        if (submissions.length > 0) {
            const rejectionRate = rejectionCount / submissions.length;
            score += rejectionRate * 25;
        }

        // 3. Missing metadata (0-20 points)
        const noMetadataCount = submissions.filter(sub =>
            !sub.metadata?.camera || sub.metadata?.camera === 'unknown'
        ).length;
        if (submissions.length > 0) {
            const noMetadataRate = noMetadataCount / submissions.length;
            score += noMetadataRate * 20;
        }

        // 4. Existing flags (0-25 points)
        const flags = data.flags || [];
        const recentFlags = flags.filter(flag => {
            if (!flag.timestamp) return false;
            const flagTime = flag.timestamp.toDate();
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return flagTime > weekAgo;
        });
        score += Math.min(recentFlags.length * 10, 25);

        const finalScore = Math.min(Math.round(score), 100);

        // Update fraud score in database
        await db.collection('fraud_tracking').doc(userId).update({
            fraudScore: finalScore,
            lastScoreUpdate: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`📊 Fraud score for user ${userId}: ${finalScore}`);

        return finalScore;
    } catch (error) {
        console.error('❌ Error calculating fraud score:', error);
        return 0;
    }
}

/**
 * Flag a farmer as suspicious
 * @param {string} userId - Farmer's user ID
 * @param {string} reason - Reason for flagging
 * @param {string} severity - 'low' | 'medium' | 'high'
 */
async function flagSuspiciousFarmer(userId, reason, severity = 'medium') {
    try {
        const trackingRef = db.collection('fraud_tracking').doc(userId);

        const flag = {
            reason,
            severity,
            timestamp: new Date() // Use Date instead of serverTimestamp for arrays
        };

        await trackingRef.update({
            flags: admin.firestore.FieldValue.arrayUnion(flag)
        });

        console.log(`🚩 Flagged user ${userId}: ${reason} (${severity})`);

        // Auto-suspend if high severity or multiple flags
        const doc = await trackingRef.get();
        const flags = doc.data()?.flags || [];

        if (severity === 'high' || flags.length >= 3) {
            await suspendFarmer(userId, 7); // Suspend for 7 days
        }
    } catch (error) {
        console.error('❌ Error flagging farmer:', error);
    }
}

/**
 * Suspend a farmer from uploading images
 * @param {string} userId - Farmer's user ID
 * @param {number} days - Number of days to suspend
 */
async function suspendFarmer(userId, days = 7) {
    try {
        const suspendUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

        await db.collection('fraud_tracking').doc(userId).update({
            suspendedUntil: admin.firestore.Timestamp.fromDate(suspendUntil)
        });

        console.log(`🚫 Suspended user ${userId} until ${suspendUntil.toISOString()}`);
    } catch (error) {
        console.error('❌ Error suspending farmer:', error);
    }
}

/**
 * Check if a farmer is currently suspended
 * @param {string} userId - Farmer's user ID
 * @returns {Promise<boolean>} True if suspended
 */
async function isFarmerSuspended(userId) {
    try {
        const doc = await db.collection('fraud_tracking').doc(userId).get();

        if (!doc.exists) {
            return false;
        }

        const suspendedUntil = doc.data()?.suspendedUntil;

        if (!suspendedUntil) {
            return false;
        }

        const now = new Date();
        const suspendDate = suspendedUntil.toDate();

        return now < suspendDate;
    } catch (error) {
        console.error('❌ Error checking suspension:', error);
        return false; // Don't block on error
    }
}

/**
 * Increment rejection count for a farmer
 * @param {string} userId - Farmer's user ID
 */
async function incrementRejectionCount(userId) {
    try {
        const trackingRef = db.collection('fraud_tracking').doc(userId);
        const doc = await trackingRef.get();

        if (doc.exists) {
            await trackingRef.update({
                rejectionCount: admin.firestore.FieldValue.increment(1)
            });
        }
    } catch (error) {
        console.error('❌ Error incrementing rejection count:', error);
    }
}

/**
 * Get fraud tracking data for a farmer (for admin dashboard)
 * @param {string} userId - Farmer's user ID
 * @returns {Promise<Object>} Fraud tracking data
 */
async function getFraudTrackingData(userId) {
    try {
        const doc = await db.collection('fraud_tracking').doc(userId).get();

        if (!doc.exists) {
            return null;
        }

        return doc.data();
    } catch (error) {
        console.error('❌ Error getting fraud tracking data:', error);
        return null;
    }
}

module.exports = {
    trackSubmission,
    checkDuplicateImages,
    checkRapidSubmissions,
    calculateFraudScore,
    flagSuspiciousFarmer,
    suspendFarmer,
    isFarmerSuspended,
    incrementRejectionCount,
    getFraudTrackingData
};
