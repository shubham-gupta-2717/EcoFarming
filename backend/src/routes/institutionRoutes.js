const express = require('express');
const router = express.Router();
const { registerInstitution, loginInstitution, changePassword, getNearbyInstitutions } = require('../controllers/institutionController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerInstitution);
router.post('/login', loginInstitution);
router.get('/nearby', getNearbyInstitutions);

// Protected routes
router.post('/change-password', verifyToken, changePassword);

module.exports = router;
