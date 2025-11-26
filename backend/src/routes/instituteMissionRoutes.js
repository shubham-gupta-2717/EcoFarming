const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const {
    getActiveMissions,
    removeFarmerMission,
    assignCustomMission,
    getFarmers
} = require('../controllers/instituteMissionController');

// All routes require institution or admin role
router.use(verifyToken);
router.use(authorizeRole('institution', 'admin', 'superadmin'));

// Get all active missions
router.get('/missions/active', getActiveMissions);

// Get list of farmers
router.get('/farmers', getFarmers);

// Remove a mission
router.delete('/missions/:missionId', removeFarmerMission);

// Assign custom mission
router.post('/missions/assign', assignCustomMission);

module.exports = router;
