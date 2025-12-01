const express = require('express');
const router = express.Router();
const {
    generateMission,
    getDailyMission,
    getWeeklyMission,
    getSeasonalMission,
    submitMission,
    generateForCrop,
    deleteMission,
    submitMissionProof,
    getPendingMissions,
    approveManually,
    rejectManually
} = require('../controllers/missionController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Protect all routes
router.use(verifyToken);

router.post('/generate', generateMission);
router.post('/generateForCrop', generateForCrop);
router.get('/daily', getDailyMission);
router.get('/weekly', getWeeklyMission);
router.get('/seasonal', getSeasonalMission);
router.post('/submit', submitMission);
router.delete('/:missionId', deleteMission);

// NEW: Photo verification routes
router.post('/:id/submit', upload.single('image'), submitMissionProof);
router.get('/pending-verification', getPendingMissions);
router.post('/:id/approve-manual', approveManually);
router.post('/:id/reject-manual', rejectManually);

module.exports = router;
