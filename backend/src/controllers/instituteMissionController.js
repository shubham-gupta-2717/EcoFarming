const { db, admin } = require('../config/firebase');

/**
 * Get all active missions across farmers
 * Query params: farmerId, crop, status
 */
const getActiveMissions = async (req, res) => {
    try {
        const { farmerId, crop, status } = req.query;
        console.log('[DEBUG] getActiveMissions called with:', { farmerId, crop, status });

        let query = db.collection('user_missions');

        // Apply filters
        if (farmerId) {
            query = query.where('userId', '==', farmerId);
        }
        if (crop) {
            query = query.where('crop', '==', crop);
        }
        if (status) {
            query = query.where('status', '==', status);
        } else {
            // Default to active missions only
            query = query.where('status', '==', 'active');
        }

        // Removed orderBy temporarily to debug index issues
        const snapshot = await query.get();

        console.log(`[DEBUG] Found ${snapshot.size} missions`);

        const missions = [];
        for (const doc of snapshot.docs) {
            const missionData = doc.data();

            // Get farmer details
            let farmerName = 'Unknown';
            let farmerEmail = '';
            let isFarmer = false;

            try {
                if (missionData.userId) {
                    const farmerDoc = await db.collection('users').doc(missionData.userId).get();
                    if (farmerDoc.exists) {
                        const farmerData = farmerDoc.data();
                        // Only show missions for actual farmers
                        if (farmerData.role === 'farmer') {
                            farmerName = farmerData.name || 'Unknown';
                            farmerEmail = farmerData.email || '';
                            isFarmer = true;
                        }
                    }
                }
            } catch (err) {
                console.error(`[DEBUG] Error fetching farmer for mission ${doc.id}:`, err);
            }

            if (isFarmer) {
                missions.push({
                    id: doc.id,
                    ...missionData,
                    farmerName,
                    farmerEmail
                });
            }
        }

        // Sort manually in memory since we removed orderBy
        missions.sort((a, b) => {
            const dateA = a.createdAt ? (a.createdAt.seconds || 0) : 0;
            const dateB = b.createdAt ? (b.createdAt.seconds || 0) : 0;
            return dateB - dateA;
        });

        res.json({
            success: true,
            count: missions.length,
            missions
        });
    } catch (error) {
        console.error('Error fetching active missions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Remove a farmer's ongoing mission
 * DELETE /api/institute/missions/:missionId
 */
const removeFarmerMission = async (req, res) => {
    try {
        const { missionId } = req.params;

        // Get mission details before deleting
        const missionDoc = await db.collection('user_missions').doc(missionId).get();

        if (!missionDoc.exists) {
            return res.status(404).json({ success: false, message: 'Mission not found' });
        }

        const missionData = missionDoc.data();

        // Delete the mission
        await db.collection('user_missions').doc(missionId).delete();

        res.json({
            success: true,
            message: 'Mission removed successfully',
            removedMission: {
                id: missionId,
                farmerId: missionData.userId,
                task: missionData.title
            }
        });
    } catch (error) {
        console.error('Error removing mission:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Assign custom mission to farmer(s)
 * POST /api/institute/missions/assign
 */
const assignCustomMission = async (req, res) => {
    try {
        const { farmerIds, mission } = req.body;

        if (!farmerIds || !Array.isArray(farmerIds) || farmerIds.length === 0) {
            return res.status(400).json({ success: false, message: 'farmerIds array is required' });
        }

        if (!mission || !mission.task) {
            return res.status(400).json({ success: false, message: 'Mission data is required' });
        }

        const assignedMissions = [];

        // Create mission for each farmer
        for (const farmerId of farmerIds) {
            const missionData = {
                userId: farmerId,
                title: mission.task,
                description: mission.description || '',
                steps: mission.steps || [],
                benefits: mission.benefits || '',
                verification: mission.verification || 'Upload proof of completion',
                credits: mission.credits || 20,
                difficulty: mission.difficulty || 'Medium',
                ecoScoreImpact: mission.ecoScoreImpact || 5,
                crop: mission.cropTarget || '',
                cropStage: mission.cropStage || '',
                category: mission.behaviorCategory || 'General',
                status: 'active',
                progress: 0,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                assignedBy: req.user.id || req.user.uid || req.user.user_id || 'system',
                assignedByRole: req.user.role || 'admin',
                isCustom: true
            };

            const missionRef = await db.collection('user_missions').add(missionData);

            assignedMissions.push({
                id: missionRef.id,
                farmerId,
                ...missionData
            });
        }

        res.json({
            success: true,
            message: `Mission assigned to ${farmerIds.length} farmer(s)`,
            assignedCount: farmerIds.length,
            missions: assignedMissions
        });
    } catch (error) {
        console.error('Error assigning mission:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get list of farmers for assignment
 * GET /api/institute/farmers
 */
const getFarmers = async (req, res) => {
    try {
        const snapshot = await db.collection('users')
            .where('role', '==', 'farmer')
            .get();

        const farmers = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name,
            email: doc.data().email,
            location: doc.data().location,
            crops: doc.data().crops || []
        }));

        res.json({
            success: true,
            count: farmers.length,
            farmers
        });
    } catch (error) {
        console.error('Error fetching farmers:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getActiveMissions,
    removeFarmerMission,
    assignCustomMission,
    getFarmers
};
