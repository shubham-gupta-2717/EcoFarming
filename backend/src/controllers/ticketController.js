const { db, admin } = require('../config/firebase');

/**
 * Create a new ticket
 */
const createTicket = async (req, res) => {
    try {
        const { type, description, photo } = req.body;
        const userId = req.user.uid;

        if (!type || !description) {
            return res.status(400).json({ message: 'Type and description are required' });
        }

        const ticketData = {
            userId,
            type,
            description,
            photo: photo || null,
            status: 'Open',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            history: [
                {
                    action: 'Created',
                    timestamp: new Date(),
                    by: 'User'
                }
            ]
        };

        // Add user details for easier admin view
        const userDoc = await db.collection('users').doc(userId).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            ticketData.userName = userData.name || 'Unknown';
            ticketData.userEmail = userData.email || 'Unknown';
            ticketData.userRole = userData.role || 'farmer';
        }

        const ticketRef = await db.collection('tickets').add(ticketData);

        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            ticket: { id: ticketRef.id, ...ticketData }
        });

    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get tickets for a user
 */
const getUserTickets = async (req, res) => {
    try {
        const userId = req.user.uid;
        const snapshot = await db.collection('tickets')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({ success: true, tickets });
    } catch (error) {
        console.error('Error fetching user tickets:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get all tickets (Admin only)
 */
const getAllTickets = async (req, res) => {
    try {
        // Optional filters
        const { status, type } = req.query;

        let query = db.collection('tickets').orderBy('createdAt', 'desc');

        if (status) query = query.where('status', '==', status);
        if (type) query = query.where('type', '==', type);

        const snapshot = await query.get();
        const tickets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json({ success: true, tickets });
    } catch (error) {
        console.error('Error fetching all tickets:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Update ticket status (Admin only)
 */
const updateTicketStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resolution } = req.body;
        const adminId = req.user.uid;

        const ticketRef = db.collection('tickets').doc(id);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const updateData = {
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            history: admin.firestore.FieldValue.arrayUnion({
                action: `Status updated to ${status}`,
                resolution: resolution || '',
                timestamp: new Date(),
                by: 'Admin'
            })
        };

        if (resolution) {
            updateData.resolution = resolution;
        }

        await ticketRef.update(updateData);

        res.status(200).json({
            success: true,
            message: 'Ticket updated successfully'
        });

    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createTicket,
    getUserTickets,
    getAllTickets,
    updateTicketStatus
};
