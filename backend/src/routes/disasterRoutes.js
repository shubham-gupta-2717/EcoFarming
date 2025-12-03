const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const {
    createDisasterRequest,
    getAllDisasterRequests,
    updateDisasterStatus,
    getFarmerDisasterRequests
} = require('../controllers/disasterController');

// Farmer Routes
router.post('/', verifyToken, createDisasterRequest);
router.get('/my-requests', verifyToken, getFarmerDisasterRequests);

// Institute/Admin Routes
router.get('/all', verifyToken, authorizeRole('admin', 'superadmin', 'institution'), getAllDisasterRequests);
router.put('/:id/status', verifyToken, authorizeRole('admin', 'superadmin', 'institution'), updateDisasterStatus);

module.exports = router;
