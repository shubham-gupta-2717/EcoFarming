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
        let query = db.collection('disaster_requests');

        // Apply filter if provided
        if (status) {
            query = query.where('status', '==', status);
        }

        const snapshot = await query.get();
        let requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort in memory to avoid composite index requirement
        requests.sort((a, b) => {
            const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
            return dateB - dateA; // Descending order
        });

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

/**
 * Get requests for the logged-in farmer
 */
const getFarmerDisasterRequests = async (req, res) => {
    try {
        const userId = req.user.uid;
        const snapshot = await db.collection('disaster_requests')
            .where('farmerId', '==', userId)
            .get();

        let requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Sort in memory
        requests.sort((a, b) => {
            const getDate = (d) => {
                if (!d) return new Date(0);
                if (d.toDate) return d.toDate();
                if (d._seconds) return new Date(d._seconds * 1000);
                return new Date(d);
            };
            return getDate(b.createdAt) - getDate(a.createdAt);
        });

        res.status(200).json({ success: true, requests });
    } catch (error) {
        console.error('Error fetching farmer requests:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete a disaster request (Institute/Admin only)
 */
const deleteDisasterRequest = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('disaster_requests').doc(id).delete();

        res.status(200).json({
            success: true,
            message: 'Request deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting disaster request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createDisasterRequest,
    getAllDisasterRequests,
    updateDisasterStatus,
    getFarmerDisasterRequests,
    deleteDisasterRequest
};
