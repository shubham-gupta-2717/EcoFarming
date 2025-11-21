const { db } = require('../config/firebase');

/**
 * Get admin dashboard statistics
 */
const getAdminStats = async (req, res) => {
    try {
        // Fetch total farmers count
        const usersSnapshot = await db.collection('users')
            .where('role', '==', 'farmer')
            .get();
        const totalFarmers = usersSnapshot.size;

        // Fetch pending verifications count
        const pendingSnapshot = await db.collection('missionSubmissions')
            .where('status', '==', 'pending')
            .get();
        const pendingVerifications = pendingSnapshot.size;

        // Fetch approved verifications today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();

        const approvedTodaySnapshot = await db.collection('missionSubmissions')
            .where('status', '==', 'approved')
            .where('verifiedAt', '>=', new Date(todayTimestamp))
            .get();
        const approvedToday = approvedTodaySnapshot.size;

        // Fetch rejected today
        const rejectedTodaySnapshot = await db.collection('missionSubmissions')
            .where('status', '==', 'rejected')
            .where('verifiedAt', '>=', new Date(todayTimestamp))
            .get();
        const rejectedToday = rejectedTodaySnapshot.size;

        // Get recent verifications for activity feed
        const recentSnapshot = await db.collection('missionSubmissions')
            .where('status', 'in', ['approved', 'rejected'])
            .orderBy('verifiedAt', 'desc')
            .limit(5)
            .get();

        const recentActivity = [];
        recentSnapshot.forEach(doc => {
            recentActivity.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({
            stats: {
                totalFarmers,
                pendingVerifications,
                approvedToday,
                rejectedToday
            },
            recentActivity
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAdminStats };
