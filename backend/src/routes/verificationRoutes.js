const express = require('express');
const router = express.Router();
const { getPendingVerifications, approveVerification, rejectVerification } = require('../controllers/verificationController');
const verifyToken = require('../middleware/authMiddleware');

// router.use(verifyToken);

router.get('/pending', getPendingVerifications);
router.post('/approve', approveVerification);
router.post('/reject', rejectVerification);

module.exports = router;
