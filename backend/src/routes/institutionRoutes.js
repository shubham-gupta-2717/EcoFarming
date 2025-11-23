const express = require('express');
const router = express.Router();
const { registerInstitution, loginInstitution } = require('../controllers/institutionController');

// Public routes
router.post('/register', registerInstitution);
router.post('/login', loginInstitution);

module.exports = router;
