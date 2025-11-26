const express = require('express');
const router = express.Router();
const { generateMission, getDailyMission, getWeeklyMission, getSeasonalMission, submitMission, generateForCrop, deleteMission } = require('../controllers/missionController');
const { verifyToken } = require('../middleware/authMiddleware');

// Protect all routes
router.use(verifyToken);

router.post('/generate', generateMission);
router.post('/generateForCrop', generateForCrop);  // NEW - Crop-specific generation
router.get('/daily', getDailyMission);
router.get('/weekly', getWeeklyMission);
router.get('/seasonal', getSeasonalMission);
router.post('/submit', submitMission);
router.delete('/:missionId', deleteMission);

module.exports = router;
