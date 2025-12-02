const { db } = require('../config/firebase');

const registerInstitution = async (req, res) => {
    try {
        const { institutionName, type, registrationId, contactPerson, email, phone, address, website, state, district, subDistrict, village } = req.body;

        // Basic validation
        if (!institutionName || !type || !registrationId || !contactPerson || !email || !phone || !address) {
            return res.status(400).json({ message: 'All required fields must be filled' });
        }

        const newInstitution = {
            institutionName,
            type,
            registrationId,
            contactPerson,
            email,
            phone,
            address,
            state: req.body.state || '',
            district: req.body.district || '',
            subDistrict: req.body.subDistrict || '',
            village: req.body.village || '',
            website: website || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Save to 'pending_institutions' collection
        const docRef = await db.collection('pending_institutions').add(newInstitution);

        res.status(201).json({
            message: 'Institution registration submitted successfully',
            id: docRef.id
        });

    } catch (error) {
        console.error('Error registering institution:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const loginInstitution = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check for Demo Admin
        if (email === 'admin@ecofarming.com' && password === 'admin123') {
            const token = require('jsonwebtoken').sign(
                {
                    uid: 'admin-user-1',
                    email: 'admin@ecofarming.com',
                    role: 'admin',
                    name: 'System Admin'
                },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    uid: 'admin-user-1',
                    email: 'admin@ecofarming.com',
                    name: 'System Admin',
                    role: 'admin'
                }
            });
        }

        // Check for Super Admin
        if (email === 'superadmin@ecofarming.in' && password === 'EcoAdmin') {
            const token = require('jsonwebtoken').sign(
                {
                    uid: 'super-admin-1',
                    email: 'superadmin@ecofarming.in',
                    role: 'superadmin',
                    name: 'Super Admin'
                },
                process.env.JWT_SECRET || 'default_secret',
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    uid: 'super-admin-1',
                    email: 'superadmin@ecofarming.in',
                    name: 'Super Admin',
                    role: 'superadmin'
                }
            });
        }

        // Query Firestore for institution with this email
        const snapshot = await db.collection('institutions').where('email', '==', email).get();

        if (snapshot.empty) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Assuming email is unique, get the first document
        const doc = snapshot.docs[0];
        const institution = doc.data();

        // Verify password (plain text for now as per MVP)
        if (institution.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate Token
        const token = require('jsonwebtoken').sign(
            {
                uid: doc.id,
                email: institution.email,
                role: 'institution',
                name: institution.institutionName
            },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                uid: doc.id,
                email: institution.email,
                name: institution.institutionName,
                role: 'institution'
            }
        });

    } catch (error) {
        console.error('Error logging in institution:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.uid; // From auth middleware

        console.log(`[ChangePassword] Request for UserID: ${userId}`);

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required' });
        }

        // Get institution doc
        const docRef = db.collection('institutions').doc(userId);
        const doc = await docRef.get();

        if (!doc.exists) {
            console.log(`[ChangePassword] Institution document not found for ID: ${userId}`);
            // Check if it's a demo admin or superadmin
            if (userId === 'admin-user-1' || userId === 'super-admin-1') {
                return res.status(403).json({ message: 'Cannot change password for Demo/Super Admin accounts.' });
            }
            return res.status(404).json({ message: 'Institution not found' });
        }

        const institution = doc.data();

        // Verify current password (plain text for MVP)
        if (institution.password !== currentPassword) {
            console.log(`[ChangePassword] Incorrect current password for ${userId}`);
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        // Update password
        await docRef.update({
            password: newPassword,
            updatedAt: new Date().toISOString()
        });

        console.log(`[ChangePassword] Password updated successfully for ${userId}`);
        res.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    registerInstitution,
    loginInstitution,
    changePassword
};
