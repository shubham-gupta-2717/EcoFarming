const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    getDashboard,
    assignMission,
    startMission,
    checkInMission,
    completeMission,
    getStats,
    getBadges,
    getLeaderboard
} = require('../controllers/gamificationController');

// All routes require authentication
router.use(verifyToken);

// Dashboard
router.get('/dashboard', getDashboard);

// Missions
router.post('/mission/assign', assignMission);
router.post('/mission/start', startMission);
router.post('/mission/checkin', checkInMission);
router.post('/mission/complete', completeMission);

// Stats & Badges
router.get('/stats', getStats);
router.get('/badges', getBadges);

// Leaderboard
router.get('/leaderboard', getLeaderboard);

module.exports = router;
