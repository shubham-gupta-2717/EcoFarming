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
    updateOrderStatus,
    getFarmerEcoScoreHistory
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
router.get('/farmers', authorizeRole('superadmin', 'institution'), getAllFarmers);
router.delete('/institutions/:id', authorizeRole('superadmin'), removeInstitution);
router.delete('/farmers/:id', authorizeRole('superadmin'), removeFarmer);
router.get('/farmers/:farmerId/history', authorizeRole('superadmin'), getFarmerEcoScoreHistory);
router.post('/deny/:id', authorizeRole('superadmin'), denyInstitution);
router.get('/history', authorizeRole('superadmin'), getInstitutionHistory);

// Order Management
router.get('/orders', authorizeRole('superadmin', 'admin', 'institution'), getAllOrders);
router.put('/orders/:id/status', authorizeRole('superadmin', 'admin', 'institution'), updateOrderStatus);

// Fraud Detection & Alerts
router.get('/flagged-farmers', authorizeRole('superadmin', 'institution'), async (req, res) => {
    try {
        const { db } = require('../config/firebase');

        const snapshot = await db.collection('fraud_tracking')
            .where('fraudScore', '>', 40)
            .get();

        const flaggedFarmers = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();
            const userDoc = await db.collection('users').doc(data.userId).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                flaggedFarmers.push({
                    userId: data.userId,
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    fraudScore: data.fraudScore,
                    flags: data.flags || [],
                    suspendedUntil: data.suspendedUntil,
                    lastSubmission: data.lastSubmission,
                    rejectionCount: data.rejectionCount || 0,
                    submissionCount: data.submissions?.length || 0
                });
            }
        }

        // Sort by fraud score (highest first)
        flaggedFarmers.sort((a, b) => b.fraudScore - a.fraudScore);

        res.json({ success: true, flaggedFarmers });
    } catch (error) {
        console.error('Error fetching flagged farmers:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/fraud-alerts', authorizeRole('superadmin', 'institution'), async (req, res) => {
    try {
        const { db, admin } = require('../config/firebase');

        const oneDayAgo = admin.firestore.Timestamp.fromDate(
            new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        const snapshot = await db.collection('fraud_tracking').get();

        const alerts = [];
        for (const doc of snapshot.docs) {
            const data = doc.data();

            // Get recent flags (last 24 hours)
            const recentFlags = (data.flags || []).filter(flag => {
                if (!flag.timestamp) return false;
                const flagTime = flag.timestamp instanceof Date ?
                    flag.timestamp : flag.timestamp.toDate();
                return flagTime > oneDayAgo.toDate();
            });

            if (recentFlags.length > 0) {
                const userDoc = await db.collection('users').doc(data.userId).get();
                const userData = userDoc.exists ? userDoc.data() : {};

                alerts.push({
                    userId: data.userId,
                    farmerName: userData.name || 'Unknown',
                    farmerEmail: userData.email || '',
                    flags: recentFlags,
                    fraudScore: data.fraudScore,
                    timestamp: recentFlags[recentFlags.length - 1].timestamp
                });
            }
        }

        // Sort by most recent first
        alerts.sort((a, b) => {
            const timeA = a.timestamp instanceof Date ? a.timestamp : a.timestamp.toDate();
            const timeB = b.timestamp instanceof Date ? b.timestamp : b.timestamp.toDate();
            return timeB - timeA;
        });

        res.json({ success: true, alerts, count: alerts.length });
    } catch (error) {
        console.error('Error fetching fraud alerts:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
