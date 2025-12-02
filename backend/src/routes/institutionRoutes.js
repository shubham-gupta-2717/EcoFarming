const express = require('express');
const router = express.Router();
const { registerInstitution, loginInstitution, changePassword } = require('../controllers/institutionController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', registerInstitution);
router.post('/login', loginInstitution);

// Protected routes
router.post('/change-password', verifyToken, changePassword);

module.exports = router;
