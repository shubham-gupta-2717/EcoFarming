const { db } = require('../config/firebase');

/**
 * Enriches farmer data with fraud tracking information
 * @param {Array} farmerDocs - Array of Firestore document snapshots
 * @returns {Promise<Array>} - Array of enriched farmer objects
 */
const enrichFarmersWithFraudData = async (farmerDocs) => {
    const enrichedFarmers = [];

    for (const doc of farmerDocs) {
        const farmerData = { id: doc.id, ...doc.data() };

        // Fetch fraud tracking data
        try {
            const fraudDoc = await db.collection('fraud_tracking').doc(doc.id).get();
            if (fraudDoc.exists) {
                const fraudData = fraudDoc.data();
                farmerData.fraudScore = fraudData.fraudScore || 0;
                farmerData.flagCount = fraudData.flags?.length || 0;

                // Check suspension status
                if (fraudData.suspendedUntil) {
                    const suspendDate = fraudData.suspendedUntil.toDate();
                    farmerData.isSuspended = new Date() < suspendDate;
                    farmerData.suspendedUntil = fraudData.suspendedUntil;
                } else {
                    farmerData.isSuspended = false;
                }

                // Calculate risk level
                farmerData.riskLevel = fraudData.fraudScore > 70 ? 'high' :
                    fraudData.fraudScore > 40 ? 'medium' : 'low';
            } else {
                // No fraud data - default to safe values
                farmerData.fraudScore = 0;
                farmerData.isSuspended = false;
                farmerData.flagCount = 0;
                farmerData.riskLevel = 'low';
            }
        } catch (fraudError) {
            console.error(`Error fetching fraud data for farmer ${doc.id}:`, fraudError);
            // Default values on error
            farmerData.fraudScore = 0;
            farmerData.isSuspended = false;
            farmerData.flagCount = 0;
            farmerData.riskLevel = 'low';
        }

        enrichedFarmers.push(farmerData);
    }

    return enrichedFarmers;
};

module.exports = { enrichFarmersWithFraudData };
