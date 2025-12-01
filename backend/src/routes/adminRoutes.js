const express = require('express');
const router = express.Router();
const {
    getAdminStats,
    superAdminLogin,
    getPendingRequests,
    approveInstitution,
    getAllInstitutions,
    getAllFarmers,
    removeInstitution,
    denyInstitution,
    removeFarmer,
    getInstitutionHistory,
    getAllOrders,
    updateOrderStatus
} = require('../controllers/adminController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

// Public Route (Login)
router.post('/login', superAdminLogin);

// Protected Routes
router.use(verifyToken);

// Super Admin Only Routes
// Note: We might need to update authorizeRole to accept 'superadmin' if not already handled
// For now, assuming 'admin' covers it or we add 'superadmin'
router.get('/stats', authorizeRole('superadmin', 'institution'), getAdminStats);
router.get('/requests', authorizeRole('superadmin'), getPendingRequests);
router.post('/approve/:id', authorizeRole('superadmin'), approveInstitution);
router.get('/institutions', authorizeRole('superadmin'), getAllInstitutions);
router.get('/farmers', authorizeRole('superadmin'), getAllFarmers);
router.delete('/institutions/:id', authorizeRole('superadmin'), removeInstitution);
router.delete('/farmers/:id', authorizeRole('superadmin'), removeFarmer);
router.post('/deny/:id', authorizeRole('superadmin'), denyInstitution);
router.get('/history', authorizeRole('superadmin'), getInstitutionHistory);

// Order Management
router.get('/orders', authorizeRole('superadmin', 'admin', 'institution'), getAllOrders);
router.put('/orders/:id/status', authorizeRole('superadmin', 'admin', 'institution'), updateOrderStatus);

module.exports = router;
