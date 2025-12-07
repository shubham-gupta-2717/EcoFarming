const { db } = require('../config/firebase');

const jwt = require('jsonwebtoken');
const { sendEmail } = require('../config/email');

// Hardcoded Super Admin Credentials (for MVP)
const SUPER_ADMIN_EMAIL = 'superadmin@ecofarming.com';
const SUPER_ADMIN_PASSWORD = 'EcoAdmin';

console.log('\n🔐 SUPER ADMIN CREDENTIALS:');
console.log('Email: ' + SUPER_ADMIN_EMAIL);
console.log('Password: ' + SUPER_ADMIN_PASSWORD);
console.log('--------------------------\n');

// Helper to log institution actions
const logInstitutionAction = async (institutionId, institutionName, action, details = '') => {
    try {
        await db.collection('institution_history').add({
            institutionId,
            institutionName,
            action,
            details,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error logging institution action:', error);
    }
};

// Super Admin Login
const superAdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
            const token = jwt.sign(
                { email: SUPER_ADMIN_EMAIL, role: 'superadmin' },
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                message: 'Login successful',
                token,
                role: 'superadmin'
            });
        }

        return res.status(401).json({ message: 'Invalid credentials' });

    } catch (error) {
        console.error('Super Admin Login Error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get Dashboard Stats
const getAdminStats = async (req, res) => {
    try {
        console.log("Fetching admin stats...");

        // Fetch all farmers to count them (safer than count() for debugging)
        const farmersSnapshot = await db.collection('users').where('role', '==', 'farmer').get();
        const farmersCount = farmersSnapshot.size;
        console.log(`Found ${farmersCount} farmers`);

        // Fetch all institutions
        const institutionsSnapshot = await db.collection('institutions').get();
        const institutionsCount = institutionsSnapshot.size;
        console.log(`Found ${institutionsCount} institutions`);

        // Fetch pending requests
        const pendingSnapshot = await db.collection('pending_institutions').where('status', '==', 'pending').get();
        const pendingCount = pendingSnapshot.size;
        console.log(`Found ${pendingCount} pending requests`);

        res.status(200).json({
            totalFarmers: farmersCount,
            totalInstitutions: institutionsCount,
            pendingRequests: pendingCount
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Error fetching stats' });
    }
};

// Get Pending Requests
const getPendingRequests = async (req, res) => {
    try {
        console.log("Fetching pending requests...");
        const snapshot = await db.collection('pending_institutions')
            .where('status', '==', 'pending')
            // .orderBy('createdAt', 'desc') // Commented out to avoid index issues for now
            .get();

        console.log(`Found ${snapshot.size} pending requests`);

        const requests = [];
        snapshot.forEach(doc => {
            requests.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ message: 'Error fetching requests' });
    }
};

// Approve Institution
const approveInstitution = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('pending_institutions').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const institutionData = doc.data();

        // Generate a random password
        const generatedPassword = Math.random().toString(36).slice(-8);

        // Create new institution user/record
        const newInstitution = {
            ...institutionData,
            status: 'approved',
            approvedAt: new Date().toISOString(),
            role: 'institution', // Role for auth
            password: generatedPassword // In production, hash this!
        };

        // Move to 'institutions' collection (or 'users' collection with role 'institution')
        // For now, let's keep them in 'institutions' collection but also maybe create a user record if we had a unified auth
        // Assuming 'institutions' is the main collection for them
        await db.collection('institutions').add(newInstitution);

        // Update status in pending
        await docRef.update({ status: 'approved' });

        // Log Action
        await logInstitutionAction(id, institutionData.institutionName, 'Approved');

        // Send Real Email
        const emailSubject = 'Institution Registration Approved - EcoFarming';
        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #16a34a; text-align: center;">Welcome to EcoFarming! 🌱</h2>
                <p>Hello <strong>${institutionData.contactPerson}</strong>,</p>
                <p>We are excited to inform you that your registration for <strong>${institutionData.institutionName}</strong> has been approved!</p>
                
                <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #15803d;">Your Login Credentials:</h3>
                    <p><strong>Email:</strong> ${institutionData.email}</p>
                    <p><strong>Password:</strong> ${generatedPassword}</p>
                </div>

                <p>Please login to your dashboard to start managing your activities.</p>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="http://localhost:5173/admin/login" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
                </div>

                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 12px; text-align: center;">This is an automated message. Please do not reply directly to this email.</p>
            </div>
        `;

        try {
            await sendEmail(institutionData.email, emailSubject, emailBody);
            console.log(`Email sent successfully to ${institutionData.email}`);
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            // Don't fail the request if email fails, but log it
        }

        res.status(200).json({ message: 'Institution approved successfully' });

    } catch (error) {
        console.error('Error approving institution:', error);
        res.status(500).json({ message: 'Error approving institution' });
    }
};

// Get All Institutions
const getAllInstitutions = async (req, res) => {
    try {
        const snapshot = await db.collection('institutions').orderBy('approvedAt', 'desc').get();
        const institutions = [];
        snapshot.forEach(doc => {
            institutions.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(institutions);
    } catch (error) {
        console.error('Error fetching institutions:', error);
        res.status(500).json({ message: 'Error fetching institutions' });
    }
};

// Get All Farmers
const getAllFarmers = async (req, res) => {
    try {
        const { state, district, subDistrict } = req.query;
        let query = db.collection('users').where('role', '==', 'farmer');

        if (state) {
            query = query.where('state', '==', state);
        }
        if (district) {
            query = query.where('district', '==', district);
        }
        if (subDistrict) {
            query = query.where('subDistrict', '==', subDistrict);
        }

        const snapshot = await query.get();
        const farmers = [];
        snapshot.forEach(doc => {
            farmers.push({ id: doc.id, ...doc.data() });
        });
        res.status(200).json(farmers);
    } catch (error) {
        console.error('Error fetching farmers:', error);
        res.status(500).json({ message: 'Error fetching farmers' });
    }
};

// Remove Institution
const removeInstitution = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('institutions').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Institution not found' });
        }

        const institutionData = doc.data();

        // Delete from Firestore
        await docRef.delete();

        // Log Action
        await logInstitutionAction(id, institutionData.institutionName, 'Removed');

        // Send Email Notification
        const emailSubject = 'Institution Access Revoked - EcoFarming';
        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #dc2626; text-align: center;">Access Revoked</h2>
                <p>Hello <strong>${institutionData.contactPerson}</strong>,</p>
                <p>We regret to inform you that your institution account for <strong>${institutionData.institutionName}</strong> has been removed from the EcoFarming platform.</p>
                <p>If you believe this is a mistake, please contact support.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 12px; text-align: center;">This is an automated message.</p>
            </div>
        `;

        try {
            await sendEmail(institutionData.email, emailSubject, emailBody);
        } catch (emailError) {
            console.error("Failed to send removal email:", emailError);
        }

        res.status(200).json({ message: 'Institution removed successfully' });

    } catch (error) {
        console.error('Error removing institution:', error);
        res.status(500).json({ message: 'Error removing institution' });
    }
};

// Deny Institution Request
const denyInstitution = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('pending_institutions').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const institutionData = doc.data();

        // Delete from Pending (or move to rejected collection if you want to keep history)
        // For now, we delete it to keep it simple, or we could update status to 'rejected'
        // Let's update status to 'rejected' so we have a record, but filter them out in getPendingRequests
        await docRef.update({ status: 'rejected' });

        // Log Action
        await logInstitutionAction(id, institutionData.institutionName, 'Denied');

        // Send Email Notification
        const emailSubject = 'Institution Registration Denied - EcoFarming';
        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #dc2626; text-align: center;">Registration Denied</h2>
                <p>Hello <strong>${institutionData.contactPerson}</strong>,</p>
                <p>We regret to inform you that your registration request for <strong>${institutionData.institutionName}</strong> has been denied.</p>
                <p>This may be due to incomplete information or eligibility criteria.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                <p style="color: #666; font-size: 12px; text-align: center;">This is an automated message.</p>
            </div>
        `;

        try {
            await sendEmail(institutionData.email, emailSubject, emailBody);
        } catch (emailError) {
            console.error("Failed to send denial email:", emailError);
        }

        res.status(200).json({ message: 'Request denied successfully' });

    } catch (error) {
        console.error('Error denying institution:', error);
        res.status(500).json({ message: 'Error denying institution' });
    }
};

// Remove Farmer
const removeFarmer = async (req, res) => {
    try {
        const { id } = req.params;
        const docRef = db.collection('users').doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        // Delete from Firestore
        await docRef.delete();

        res.status(200).json({ message: 'Farmer removed successfully' });

    } catch (error) {
        console.error('Error removing farmer:', error);
        res.status(500).json({ message: 'Error removing farmer' });
    }
};

// Get Institution History
const getInstitutionHistory = async (req, res) => {
    try {
        const snapshot = await db.collection('institution_history')
            .orderBy('timestamp', 'desc')
            .limit(50) // Limit to last 50 actions
            .get();

        const history = [];
        snapshot.forEach(doc => {
            history.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching institution history:', error);
        res.status(500).json({ message: 'Error fetching history' });
    }
};

// Get All Orders (Filtered by Institute if applicable)
const getAllOrders = async (req, res) => {
    try {
        const userRole = req.user?.role;
        const userId = req.user?.uid;

        console.log('=== GET ORDERS REQUEST ===');
        console.log('User Role:', userRole);
        console.log('User ID:', userId);

        let query = db.collection('orders');

        // If the user is an institution, filter by their institute ID
        if (userRole === 'institution') {
            console.log(`Filtering orders for institute: ${userId}`);
            query = query.where('fulfillingInstituteId', '==', userId);
        } else {
            // Super admin or regular admin sees all orders
            console.log(`Fetching all orders for ${userRole}`);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();

        const orders = [];
        snapshot.forEach(doc => {
            const orderData = { id: doc.id, ...doc.data() };
            console.log(`Order ${doc.id}: fulfillingInstituteId = ${orderData.fulfillingInstituteId}`);
            orders.push(orderData);
        });

        console.log(`Returning ${orders.length} orders for user role: ${userRole}`);
        console.log('=========================');
        res.status(200).json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);

        // Check if it's a Firestore index error
        if (error.code === 9 || error.message?.includes('index')) {
            console.error('FIRESTORE INDEX ERROR: You need to create a composite index.');
            console.error('The error message should contain a link to create the index automatically.');
            return res.status(500).json({
                message: 'Firestore index required. Please check server logs for the index creation link.',
                error: error.message
            });
        }

        res.status(500).json({ message: 'Error fetching orders' });
    }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const orderRef = db.collection('orders').doc(id);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const orderData = orderDoc.data();

        // Prepare update object
        const updateData = { status };

        // Add timestamps for status changes
        if (status === 'Ready for Pickup' && !orderData.pickupReadyDate) {
            updateData.pickupReadyDate = new Date();
        }
        if (status === 'Dispatched' && !orderData.dispatchedDate) {
            updateData.dispatchedDate = new Date();
        }
        if ((status === 'Delivered' || status === 'Picked Up') && !orderData.deliveredDate) {
            updateData.deliveredDate = new Date();
        }

        // Update in central collection
        await orderRef.update(updateData);

        // Update in user's document
        if (orderData.userId) {
            const userRef = db.collection('users').doc(orderData.userId);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                let userOrders = userData.orders || [];

                // Find and update the specific order
                const orderIndex = userOrders.findIndex(o => o.id === id);
                if (orderIndex !== -1) {
                    userOrders[orderIndex].status = status;
                    // Also update dates in user's order copy
                    if (updateData.pickupReadyDate) {
                        userOrders[orderIndex].pickupReadyDate = updateData.pickupReadyDate;
                    }
                    if (updateData.dispatchedDate) {
                        userOrders[orderIndex].dispatchedDate = updateData.dispatchedDate;
                    }
                    if (updateData.deliveredDate) {
                        userOrders[orderIndex].deliveredDate = updateData.deliveredDate;
                    }
                    await userRef.update({ orders: userOrders });
                }
            }
        }

        res.status(200).json({ message: 'Order status updated successfully' });

    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status' });
    }
};

// Get Farmer EcoScore History
const getFarmerEcoScoreHistory = async (req, res) => {
    try {
        const { farmerId } = req.params;
        const snapshot = await db.collection('ecoscore_history')
            .where('userId', '==', farmerId)
            .orderBy('timestamp', 'desc')
            .get();

        const history = [];
        snapshot.forEach(doc => history.push({ id: doc.id, ...doc.data() }));

        res.status(200).json(history);
    } catch (error) {
        console.error('Error fetching farmer ecoscore history:', error);
        res.status(500).json({ message: 'Error fetching history' });
    }
};

module.exports = {
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
};
