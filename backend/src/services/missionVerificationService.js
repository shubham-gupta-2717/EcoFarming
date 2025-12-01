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

Respond ONLY with a JSON object in this exact format:
{
  "approved": true/false,
  "reason": "Brief explanation (max 100 words)",
  "confidence": 0.0-1.0
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
        if (typeof verification.approved !== 'boolean' || !verification.reason) {
            throw new Error('Invalid verification response structure');
        }

        console.log('✅ Verification result:', verification.approved ? 'APPROVED' : 'REJECTED');

        return {
            approved: verification.approved,
            reason: verification.reason,
            confidence: verification.confidence || 0.8
        };

    } catch (error) {
        console.error('❌ Error in AI verification:', error);

        // Fallback: return pending for manual review
        return {
            approved: false,
            reason: 'AI verification failed. Pending manual review by admin.',
            confidence: 0.0,
            error: error.message
        };
    }
}

/**
 * Award points to farmer after mission verification
 * @param {string} userId - Farmer's user ID
 * @param {string} missionId - Mission ID
 * @param {number} points - Points to award
 */
async function awardPoints(userId, missionId, points) {
    try {
        console.log(`💰 Awarding ${points} points to user ${userId} for mission ${missionId}`);

        const userRef = db.collection('users').doc(userId);
        const missionRef = db.collection('user_missions').doc(missionId);

        // Use transaction to ensure atomic update
        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userRef);
            const missionDoc = await transaction.get(missionRef);

            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            if (!missionDoc.exists) {
                throw new Error('Mission not found');
            }

            const currentEcoScore = userDoc.data().ecoScore || 0;
            const currentCredits = userDoc.data().credits || 0;

            // Update user's ecoScore and credits
            transaction.update(userRef, {
                ecoScore: currentEcoScore + points,
                credits: currentCredits + points,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Mark mission as completed and points awarded
            transaction.update(missionRef, {
                status: 'COMPLETED',
                pointsAwarded: true,
                completedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });

        console.log('✅ Points awarded successfully');

        // Award gamification points using existing service
        try {
            const { awardPoints: gamificationAwardPoints, POINTS_CONFIG } = require('./gamificationService');
            await gamificationAwardPoints(
                userId,
                points,
                'mission_complete',
                `Completed mission: ${missionId}`,
                missionId
            );
        } catch (error) {
            console.error('Warning: Gamification points award failed:', error);
            // Don't fail the entire operation if gamification fails
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
            // Note: Keep imageUrl and notes in Firestore so admin can review them
            // Only delete from Cloudinary when farmer re-submits
        }

        await missionRef.update(updateData);

        // If approved, award points
        if (verification.approved) {
            await awardPoints(mission.userId, missionId, mission.points);
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
