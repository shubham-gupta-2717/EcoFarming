const { generateMissionFromAI } = require('../services/missionService');
const { db } = require('../config/firebase');

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

module.exports = { generateMission, getDailyMission, getWeeklyMission, getSeasonalMission, submitMission };
