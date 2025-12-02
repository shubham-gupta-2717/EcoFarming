const { db, admin } = require('../config/firebase');
const { awardPoints } = require('../services/missionVerificationService');

/**
 * Get all pending verification requests from Firestore
 */
const getPendingVerifications = async (req, res) => {
    try {
        const verificationsRef = db.collection('user_missions');
        // Fetch missions with status 'SUBMITTED' (waiting for AI or Manual review)
        // or 'VERIFIED' (AI approved but maybe needs manual check? No, usually SUBMITTED means pending)
        // Actually, if AI fails or is unsure, it might leave it as SUBMITTED or set a flag.
        // Let's assume 'SUBMITTED' is the status for pending review.
        // Also, if AI rejects, it might set REJECTED.
        // If AI approves, it sets VERIFIED.
        // So pending manual review might be missions where AI failed or confidence was low?
        // Or maybe we want to review ALL submissions?
        // For now, let's fetch 'SUBMITTED' missions.

        const snapshot = await verificationsRef
            .where('status', '==', 'SUBMITTED')
            .orderBy('submittedAt', 'desc')
            .get();

        if (snapshot.empty) {
            return res.json({ requests: [] });
        }

        const requests = [];
        // We need to fetch user details for each mission to show name/village
        // This might be slow if many requests. Ideally, we should store farmerName in mission doc.
        // For now, let's fetch user details in parallel.

        const userIds = new Set();
        snapshot.forEach(doc => userIds.add(doc.data().userId));

        const userMap = {};
        if (userIds.size > 0) {
            // Firestore 'in' query supports up to 10 items. If more, we need to batch or fetch individually.
            // Fetching individually for simplicity in MVP.
            await Promise.all(Array.from(userIds).map(async (uid) => {
                const uDoc = await db.collection('users').doc(uid).get();
                if (uDoc.exists) userMap[uid] = uDoc.data();
            }));
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const user = userMap[data.userId] || {};

            requests.push({
                id: doc.id,
                ...data,
                farmerName: user.name || 'Unknown',
                farmerEmail: user.email || '',
                village: user.village || user.location || '',
                proofUrl: data.imageUrl, // Map imageUrl to proofUrl for frontend
                missionTitle: data.title,
                submittedAt: data.submittedAt
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
        const docRef = db.collection('user_missions').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const data = doc.data();
        const userDoc = await db.collection('users').doc(data.userId).get();
        const user = userDoc.exists ? userDoc.data() : {};

        res.json({
            id: doc.id,
            ...data,
            farmerName: user.name,
            farmerEmail: user.email,
            village: user.village,
            proofUrl: data.imageUrl
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
        let query = db.collection('user_missions');

        // Map frontend status to Firestore status
        // Frontend: 'approved' -> Firestore: 'COMPLETED' (since points are awarded) or 'VERIFIED'
        // Frontend: 'rejected' -> Firestore: 'REJECTED'

        let dbStatus = [];
        if (status === 'approved') dbStatus = ['COMPLETED', 'VERIFIED'];
        else if (status === 'rejected') dbStatus = ['REJECTED'];
        else dbStatus = ['COMPLETED', 'VERIFIED', 'REJECTED'];

        query = query.where('status', 'in', dbStatus);

        const snapshot = await query
            .orderBy('submittedAt', 'desc') // Use submittedAt or completedAt
            .limit(parseInt(limit))
            .get();

        const history = [];
        // Fetch users similar to pending
        const userIds = new Set();
        snapshot.forEach(doc => userIds.add(doc.data().userId));

        const userMap = {};
        if (userIds.size > 0) {
            await Promise.all(Array.from(userIds).map(async (uid) => {
                const uDoc = await db.collection('users').doc(uid).get();
                if (uDoc.exists) userMap[uid] = uDoc.data();
            }));
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            const user = userMap[data.userId] || {};

            history.push({
                id: doc.id,
                ...data,
                farmerName: user.name || 'Unknown',
                farmerEmail: user.email || '',
                village: user.village || '',
                proofUrl: data.imageUrl,
                status: data.status === 'COMPLETED' || data.status === 'VERIFIED' ? 'approved' : 'rejected'
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

        if (!id) {
            return res.status(400).json({ message: 'Submission ID is required' });
        }

        // Get submission details
        const missionRef = db.collection('user_missions').doc(id);
        const missionDoc = await missionRef.get();

        if (!missionDoc.exists) {
            return res.status(404).json({ message: 'Mission not found' });
        }

        const mission = missionDoc.data();

        // Use the centralized awardPoints service
        // This handles updating user score, mission status, and gamification
        await awardPoints(mission.userId, id);

        // Update admin comments if any
        await missionRef.update({
            adminId,
            adminComments: comments || '',
            verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
            manualVerified: true
        });

        // Log admin action
        await db.collection('adminLogs').add({
            adminId,
            action: 'approve',
            missionId: id,
            farmerId: mission.userId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            comments: comments || ''
        });

        res.json({
            success: true,
            message: 'Submission approved successfully'
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

        if (!id) {
            return res.status(400).json({ message: 'Submission ID is required' });
        }

        if (!reason || reason.trim() === '') {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        const missionRef = db.collection('user_missions').doc(id);

        await missionRef.update({
            status: 'REJECTED',
            adminId,
            adminComments: reason,
            verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
            manualVerified: true
        });

        // Log admin action
        await db.collection('adminLogs').add({
            adminId,
            action: 'reject',
            missionId: id,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            comments: reason
        });

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
