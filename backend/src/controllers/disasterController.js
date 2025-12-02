const { db, admin } = require('../config/firebase');

/**
 * Create a disaster help request
 */
const createDisasterRequest = async (req, res) => {
    try {
        const { type, details, photo, gps } = req.body;
        const userId = req.user.uid;

        if (!type || !details) {
            return res.status(400).json({ message: 'Type and details are required' });
        }

        const requestData = {
            farmerId: userId,
            type,
            details,
            photo: photo || null,
            gps: gps || null,
            status: 'Pending',
            broadcastTo: 'All Institutes',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Add farmer details
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            requestData.farmerName = userData.name || 'Unknown';
            requestData.farmerMobile = userData.mobile || 'Unknown';
            requestData.farmerLocation = userData.location || 'Unknown';
        }

        const requestRef = await db.collection('disaster_requests').add(requestData);

        res.status(201).json({
            success: true,
            message: 'Help request broadcasted to all institutes',
            request: { id: requestRef.id, ...requestData }
        });

    } catch (error) {
        console.error('Error creating disaster request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get all disaster requests (Institute/Admin only)
 */
const getAllDisasterRequests = async (req, res) => {
    try {
        const { status } = req.query;
        let query = db.collection('disaster_requests').orderBy('createdAt', 'desc');

        if (status) {
            query = query.where('status', '==', status);
        }

        const snapshot = await query.get();
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({ success: true, requests });
    } catch (error) {
        console.error('Error fetching disaster requests:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update request status (Institute/Admin only)
 */
const updateDisasterStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, responseNote } = req.body;
        const responderId = req.user.uid;

        const requestRef = db.collection('disaster_requests').doc(id);
        const requestDoc = await requestRef.get();

        if (!requestDoc.exists) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const updateData = {
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            responseNote: responseNote || '',
            respondedBy: responderId
        };

        await requestRef.update(updateData);

        res.status(200).json({
            success: true,
            message: 'Request status updated'
        });

    } catch (error) {
        console.error('Error updating disaster request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createDisasterRequest,
    getAllDisasterRequests,
    updateDisasterStatus
};
