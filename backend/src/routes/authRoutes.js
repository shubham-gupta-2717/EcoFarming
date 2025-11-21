const express = require('express');
const router = express.Router();
const { verifyFarmerLogin, adminLogin, createAdmin, register, getProfile, updateProfile } = require('../controllers/authController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

console.log("Auth Routes Loaded");
console.log("verifyFarmerLogin type:", typeof verifyFarmerLogin);

// Farmer Auth
router.get('/test', (req, res) => res.send('Auth Route Working'));
router.post('/farmer/login', verifyFarmerLogin); // Replaces verify-token
router.post('/verify-token', verifyFarmerLogin); // Backward compatibility

// Admin Auth
router.post('/admin/login', adminLogin);
router.post('/admin/create', createAdmin);

// Shared
router.post('/register', register);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

// Example protected route
router.get('/admin/stats', verifyToken, authorizeRole('admin'), (req, res) => {
    res.json({ message: 'Admin stats data' });
});

module.exports = router;
