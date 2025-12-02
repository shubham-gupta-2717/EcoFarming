const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');
const {
    createDisasterRequest,
    getAllDisasterRequests,
    updateDisasterStatus
} = require('../controllers/disasterController');

// Farmer Routes
router.post('/', verifyToken, createDisasterRequest);

// Institute/Admin Routes
router.get('/all', verifyToken, authorizeRole('admin', 'superadmin', 'institution'), getAllDisasterRequests);
router.put('/:id/status', verifyToken, authorizeRole('admin', 'superadmin', 'institution'), updateDisasterStatus);

module.exports = router;
