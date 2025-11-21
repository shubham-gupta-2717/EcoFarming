const { db, admin } = require('../config/firebase');

/**
 * Get all pending verification requests from Firestore
 */
const getPendingVerifications = async (req, res) => {
    try {
        const verificationsRef = db.collection('missionSubmissions');
        const snapshot = await verificationsRef
            .where('status', '==', 'pending')
            .orderBy('submittedAt', 'desc')
            .get();

        if (snapshot.empty) {
            return res.json({ requests: [] });
        }

        const requests = [];
        snapshot.forEach(doc => {
            requests.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({ requests });
    } catch (error) {
        console.error('Error fetching pending verifications:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get verification by ID
 */
const getVerificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('missionSubmissions').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        res.json({
            id: doc.id,
            ...doc.data()
        });
    } catch (error) {
        console.error('Error fetching verification:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Get verification history (approved/rejected)
 */
const getVerificationHistory = async (req, res) => {
    try {
        const { status, limit = 50 } = req.query;
        let query = db.collection('missionSubmissions');

        if (status && (status === 'approved' || status === 'rejected')) {
            query = query.where('status', '==', status);
        } else {
            query = query.where('status', 'in', ['approved', 'rejected']);
        }

        const snapshot = await query
            .orderBy('verifiedAt', 'desc')
            .limit(parseInt(limit))
            .get();

        const history = [];
        snapshot.forEach(doc => {
            history.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({ history });
    } catch (error) {
        console.error('Error fetching verification history:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Approve verification - Complete workflow
 */
const approveVerification = async (req, res) => {
    try {
        const { id, comments } = req.body;
        const adminId = req.user.uid;
        const adminEmail = req.user.email;

        if (!id) {
            return res.status(400).json({ message: 'Submission ID is required' });
        }

        // Get submission details
        const submissionRef = db.collection('missionSubmissions').doc(id);
        const submissionDoc = await submissionRef.get();

        if (!submissionDoc.exists) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const submission = submissionDoc.data();

        // Start batch write
        const batch = db.batch();

        // 1. Update submission status
        batch.update(submissionRef, {
            status: 'approved',
            adminId,
            adminComments: comments || '',
            verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 2. Update user stats
        const userRef = db.collection('users').doc(submission.farmerId);
        const userDoc = await userRef.get();

        if (userDoc.exists) {
            const userData = userDoc.data();
            const creditsToAward = submission.credits || 50;

            batch.update(userRef, {
                credits: (userData.credits || 0) + creditsToAward,
                ecoScore: (userData.ecoScore || 0) + creditsToAward,
                completedMissions: (userData.completedMissions || 0) + 1,
                lastMissionCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
                // Continue streak
                currentStreak: (userData.currentStreak || 0) + 1,
                longestStreak: Math.max((userData.longestStreak || 0), (userData.currentStreak || 0) + 1)
            });
        }

        // 3. Log admin action
        const logRef = db.collection('adminLogs').doc();
        batch.set(logRef, {
            adminId,
            adminEmail,
            action: 'approve',
            submissionId: id,
            farmerId: submission.farmerId,
            missionId: submission.missionId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            comments: comments || ''
        });

        // 4. Add to behavior tracking
        if (submission.behaviorCategory) {
            const behaviorRef = db.collection('behaviorTracking').doc();
            batch.set(behaviorRef, {
                farmerId: submission.farmerId,
                category: submission.behaviorCategory,
                action: submission.missionTitle,
                credits: submission.credits || 50,
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        // Commit batch
        await batch.commit();

        res.json({
            success: true,
            message: 'Submission approved successfully',
            creditsAwarded: submission.credits || 50
        });
    } catch (error) {
        console.error('Error approving verification:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * Reject verification
 */
const rejectVerification = async (req, res) => {
    try {
        const { id, reason } = req.body;
        const adminId = req.user.uid;
        const adminEmail = req.user.email;

        if (!id) {
            return res.status(400).json({ message: 'Submission ID is required' });
        }

        if (!reason || reason.trim() === '') {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        // Get submission details
        const submissionRef = db.collection('missionSubmissions').doc(id);
        const submissionDoc = await submissionRef.get();

        if (!submissionDoc.exists) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const submission = submissionDoc.data();

        // Start batch write
        const batch = db.batch();

        // 1. Update submission status
        batch.update(submissionRef, {
            status: 'rejected',
            adminId,
            adminComments: reason,
            verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 2. Log admin action
        const logRef = db.collection('adminLogs').doc();
        batch.set(logRef, {
            adminId,
            adminEmail,
            action: 'reject',
            submissionId: id,
            farmerId: submission.farmerId,
            missionId: submission.missionId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            comments: reason
        });

        // Optional: Reset streak on rejection (configurable)
        // const userRef = db.collection('users').doc(submission.farmerId);
        // batch.update(userRef, { currentStreak: 0 });

        // Commit batch
        await batch.commit();

        res.json({
            success: true,
            message: 'Submission rejected successfully'
        });
    } catch (error) {
        console.error('Error rejecting verification:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPendingVerifications,
    getVerificationById,
    getVerificationHistory,
    approveVerification,
    rejectVerification
};
