const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db, admin } = require('../config/firebase');
const axios = require('axios');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);

/**
 * Verify mission submission image using Gemini Vision API
 * @param {string} imageUrl - Cloudinary URL of the uploaded image
 * @param {string} missionTitle - Mission title
 * @param {string} missionDescription - Mission description/steps
 * @returns {Promise<{approved: boolean, reason: string, confidence: number}>}
 */
// Point Configuration by Category
const CATEGORY_POINTS = {
    'Soil Health': 30,
    'Water Conservation': 40,
    'Pest Management': 35,
    'Crop Practices': 30,
    'Climate Resilience': 50,
    'Institute Special': 60,
    'Emergency': 80,
    'General': 20
};

/**
 * Verify mission submission image using Gemini Vision API
 * @param {string} imageUrl - Cloudinary URL of the uploaded image
 * @param {string} missionTitle - Mission title
 * @param {string} missionDescription - Mission description/steps
 * @returns {Promise<{approved: boolean, reason: string, confidence: number}>}
 */
async function verifyMissionImage(imageUrl, missionTitle, missionDescription) {
    try {
        console.log('🔍 Starting AI verification for mission:', missionTitle);

        // Download image from Cloudinary
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBase64 = Buffer.from(imageResponse.data).toString('base64');

        // Use Gemini 2.5 Flash (same as mission generation)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `You are an agricultural verification AI assistant for EcoFarming platform.

Mission Title: "${missionTitle}"
Mission Description: "${missionDescription}"

Analyze the uploaded image and verify if it shows genuine farming activity that matches the mission requirements.

Check for:
1. Does the image show real farming/agricultural activity?
2. Does the activity match the mission description?
3. Is the image clear and not blurry/fake?
4. Does it show evidence of sustainable farming practices?

Respond ONLY with a JSON object in this exact format (no markdown):
{
  "verified": true/false,
  "confidence": 0-100,
  "reason": "Why approved or rejected (max 50 words)."
}

Be strict but fair. Approve only if the image clearly shows the required farming activity.`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        console.log('🤖 AI Response:', text);

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid AI response format');
        }

        const verification = JSON.parse(jsonMatch[0]);

        // Validate response structure
        if (typeof verification.verified !== 'boolean' || !verification.reason) {
            throw new Error('Invalid verification response structure');
        }

        console.log('✅ Verification result:', verification.verified ? 'APPROVED' : 'REJECTED');

        return {
            approved: verification.verified,
            reason: verification.reason,
            confidence: verification.confidence || 80
        };

    } catch (error) {
        console.error('❌ Error in AI verification:', error);

        // Fallback: return pending for manual review
        return {
            approved: false,
            reason: 'AI verification failed. Pending manual review by admin.',
            confidence: 0,
            error: error.message
        };
    }
}

/**
 * Award points to farmer after mission verification
 * @param {string} userId - Farmer's user ID
 * @param {string} missionId - Mission ID
 * @param {number} points - Points to award (optional override)
 */
async function awardPoints(userId, missionId, points = null) {
    try {
        const userRef = db.collection('users').doc(userId);
        const missionRef = db.collection('user_missions').doc(missionId);

        // Use transaction to ensure atomic update
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            const missionDoc = await transaction.get(missionRef);

            if (!userDoc.exists) throw new Error('User not found');
            if (!missionDoc.exists) throw new Error('Mission not found');

            const missionData = missionDoc.data();

            // Determine points based on category if not provided
            let finalPoints = points;
            if (!finalPoints) {
                const category = missionData.category || 'General';
                // Match partial category names or default to General
                const matchedCategory = Object.keys(CATEGORY_POINTS).find(k => category.includes(k)) || 'General';
                finalPoints = CATEGORY_POINTS[matchedCategory];
            }

            console.log(`💰 Awarding ${finalPoints} points to user ${userId} for mission ${missionId} (Category: ${missionData.category})`);

            const currentEcoScore = userDoc.data().ecoScore || 0;
            const currentCredits = userDoc.data().credits || 0;

            // Update user's ecoScore and credits
            transaction.update(userRef, {
                ecoScore: currentEcoScore + finalPoints,
                credits: currentCredits + finalPoints,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Mark mission as completed and points awarded
            transaction.update(missionRef, {
                status: 'COMPLETED',
                pointsAwarded: true,
                points: finalPoints, // Save actual points awarded
                completedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        console.log('✅ Points awarded successfully');

        // Award gamification points using existing service
        try {
            const { awardPoints: gamificationAwardPoints } = require('./gamificationService');
            // We pass the calculated points here too
            // Note: We need to fetch the points again or pass them down. 
            // For simplicity, we'll re-calculate or assume the transaction succeeded with finalPoints.
            // Since we can't easily get finalPoints out of the transaction block without refactoring,
            // we will re-derive it or just use a standard value for the log.
            // Better approach: Move calculation outside transaction.

            // Re-calculate for gamification service call (safe since transaction is done)
            const missionDoc = await missionRef.get();
            const missionData = missionDoc.data();
            const pointsAwarded = missionData.points || 20;

            await gamificationAwardPoints(
                userId,
                pointsAwarded,
                'mission_complete',
                `Completed mission: ${missionData.title}`,
                missionId
            );
        } catch (error) {
            console.error('Warning: Gamification points award failed:', error);
        }

        return { success: true };

    } catch (error) {
        console.error('❌ Error awarding points:', error);
        throw error;
    }
}

/**
 * Process mission verification after submission
 * @param {string} missionId - Mission ID
 */
async function processMissionVerification(missionId) {
    try {
        console.log('🔄 Processing verification for mission:', missionId);

        const missionRef = db.collection('user_missions').doc(missionId);
        const missionDoc = await missionRef.get();

        if (!missionDoc.exists) {
            throw new Error('Mission not found');
        }

        const mission = missionDoc.data();

        // Verify the image
        const verification = await verifyMissionImage(
            mission.imageUrl,
            mission.title,
            mission.description
        );

        // Update mission with verification result
        const updateData = {
            aiVerified: verification.approved,
            verificationReason: verification.reason,
            verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
            verificationConfidence: verification.confidence
        };

        if (verification.approved) {
            updateData.status = 'VERIFIED';
        } else {
            updateData.status = 'REJECTED';
        }

        await missionRef.update(updateData);

        // If approved, award points (logic inside handles category points)
        if (verification.approved) {
            await awardPoints(mission.userId, missionId);
        }

        console.log('✅ Verification processed successfully');

        return {
            success: true,
            approved: verification.approved,
            reason: verification.reason
        };

    } catch (error) {
        console.error('❌ Error processing verification:', error);

        // Mark as failed verification
        await db.collection('user_missions').doc(missionId).update({
            status: 'SUBMITTED',
            verificationError: error.message,
            verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        throw error;
    }
}

module.exports = {
    verifyMissionImage,
    awardPoints,
    processMissionVerification
};
