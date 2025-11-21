const express = require('express');
const router = express.Router();
const {
    getPendingVerifications,
    getVerificationById,
    getVerificationHistory,
    approveVerification,
    rejectVerification
} = require('../controllers/verificationController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(authorizeRole('admin')); // Only admins can access verification routes

router.get('/pending', getPendingVerifications);
router.get('/history', getVerificationHistory);
router.get('/:id', getVerificationById);
router.post('/approve', approveVerification);
router.post('/reject', rejectVerification);

module.exports = router;
