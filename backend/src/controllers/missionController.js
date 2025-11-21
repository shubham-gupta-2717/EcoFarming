const { generateMissionFromAI, generateMissionForCrop } = require('../services/missionService');
const { db, admin } = require('../config/firebase');

const generateMission = async (req, res) => {
    try {
        const farmerData = req.body;
        const mission = await generateMissionFromAI(farmerData);

        if (db) {
            // await db.collection('missions').add({ ...mission, userId: req.user.uid, createdAt: new Date() });
        }

        res.status(200).json({ success: true, mission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDailyMission = async (req, res) => {
    return generateMission(req, res);
};

const getWeeklyMission = async (req, res) => {
    try {
        const farmerData = { ...req.body, missionType: 'weekly' };
        const mission = await generateMissionFromAI(farmerData);

        // Weekly missions have higher credits and difficulty
        mission.credits = mission.credits * 2;
        mission.difficulty = mission.difficulty === 'Easy' ? 'Medium' : 'Hard';
        mission.seasonalTag = 'Weekly Challenge';

        res.status(200).json({ success: true, mission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getSeasonalMission = async (req, res) => {
    try {
        const farmerData = { ...req.body, missionType: 'seasonal' };
        const mission = await generateMissionFromAI(farmerData);

        // Seasonal missions have highest credits
        mission.credits = mission.credits * 3;
        mission.difficulty = 'Hard';
        mission.ecoScoreImpact = mission.ecoScoreImpact * 2;

        res.status(200).json({ success: true, mission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const submitMission = async (req, res) => {
    try {
        const { missionId, proofImage, proofVideo, notes } = req.body;

        // In real app, save to Firestore
        const submission = {
            missionId,
            userId: req.user?.uid || 'demo-user',
            proofImage,
            proofVideo,
            notes,
            status: 'pending',
            submittedAt: new Date()
        };

        res.status(200).json({
            success: true,
            message: 'Mission submitted for verification',
            submission
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Generate mission for specific crop
 */
const generateForCrop = async (req, res) => {
    try {
        const { selectedCrop } = req.body;
        const farmerId = req.user.uid;

        if (!selectedCrop) {
            return res.status(400).json({ message: 'Selected crop is required' });
        }

        // 1. Fetch farmer data from Firestore
        const userDoc = await db.collection('users').doc(farmerId).get();

        let userData;
        let crops = [];

        if (!userDoc.exists) {
            // User doesn't exist in Firestore - create with demo crops
            console.log('User not found in Firestore, creating with demo crops');

            const demoCrops = [
                { cropName: 'Tomato', stage: 'Flowering', landSize: 0.6 },
                { cropName: 'Brinjal', stage: 'Vegetative', landSize: 0.4 },
                { cropName: 'Sugarcane', stage: 'Early Growth', landSize: 1.2 }
            ];

            userData = {
                uid: farmerId,
                email: req.user.email || 'demo@farmer.com',
                name: req.user.name || 'Demo Farmer',
                role: 'farmer',
                crops: demoCrops,
                location: 'India',
                preferredLanguage: 'en',
                credits: 0,
                ecoScore: 0,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            // Save user document
            await db.collection('users').doc(farmerId).set(userData);
            crops = demoCrops;
        } else {
            userData = userDoc.data();
            crops = userData.crops || [];

            // If user exists but has no crops, add demo crops
            if (crops.length === 0) {
                const demoCrops = [
                    { cropName: 'Tomato', stage: 'Flowering', landSize: 0.6 },
                    { cropName: 'Brinjal', stage: 'Vegetative', landSize: 0.4 },
                    { cropName: 'Sugarcane', stage: 'Early Growth', landSize: 1.2 }
                ];
                crops = demoCrops;
                await db.collection('users').doc(farmerId).update({ crops: demoCrops });
            }
        }

        // 2. Find selected crop in farmer's crop list
        const selectedCropData = crops.find(c => c.cropName === selectedCrop);

        if (!selectedCropData) {
            return res.status(404).json({
                message: 'Crop not found in your profile',
                availableCrops: crops.map(c => c.cropName)
            });
        }

        // 3. Build context for AI
        const context = {
            cropName: selectedCropData.cropName,
            cropStage: selectedCropData.stage || 'Growing',
            landSize: selectedCropData.landSize || 1,
            location: userData.location || 'India',
            season: getCurrentSeason(),
            language: userData.preferredLanguage || 'en'
        };

        // 4. Generate crop-specific mission using AI
        const mission = await generateMissionForCrop(context);

        // 5. Save mission to Firestore
        const missionRef = db.collection('missions').doc();
        const missionData = {
            ...mission,
            farmerId,
            cropTarget: selectedCropData.cropName,
            cropStage: selectedCropData.stage || 'Growing',
            missionId: missionRef.id,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'active'
        };

        await missionRef.set(missionData);

        res.status(200).json({
            success: true,
            mission: {
                ...mission,
                missionId: missionRef.id,
                cropTarget: selectedCropData.cropName,
                cropStage: selectedCropData.cropStage
            }
        });
    } catch (error) {
        console.error('Error generating crop-specific mission:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Helper: Get current season based on month
 */
function getCurrentSeason() {
    const month = new Date().getMonth() + 1; // 1-12

    if (month >= 3 && month <= 6) return 'Summer';
    if (month >= 7 && month <= 10) return 'Monsoon';
    return 'Winter';
}

module.exports = {
    generateMission,
    getDailyMission,
    getWeeklyMission,
    getSeasonalMission,
    submitMission,
    generateForCrop  // NEW
};
