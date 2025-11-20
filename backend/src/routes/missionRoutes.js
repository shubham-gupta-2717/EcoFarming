const express = require('express');
const router = express.Router();
const { generateMission, getDailyMission, getWeeklyMission, getSeasonalMission, submitMission } = require('../controllers/missionController');
const verifyToken = require('../middleware/authMiddleware');

// Public for testing, protected in production
// router.use(verifyToken); 

router.post('/generate', generateMission);
router.get('/daily', getDailyMission);
router.get('/weekly', getWeeklyMission);
router.get('/seasonal', getSeasonalMission);
router.post('/submit', submitMission);

module.exports = router;
