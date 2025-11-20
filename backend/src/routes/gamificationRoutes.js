const express = require('express');
const router = express.Router();
const { getLeaderboard, getBadges, getUserStats, getVillageLeaderboard, getPanchayatLeaderboard, getGlobalLeaderboard } = require('../controllers/gamificationController');
const verifyToken = require('../middleware/authMiddleware');

// router.use(verifyToken); // Protect all routes

router.get('/leaderboard', getLeaderboard);
router.get('/leaderboard/village', getVillageLeaderboard);
router.get('/leaderboard/panchayat', getPanchayatLeaderboard);
router.get('/leaderboard/global', getGlobalLeaderboard);
router.get('/badges', getBadges);
router.get('/stats', getUserStats);

module.exports = router;
