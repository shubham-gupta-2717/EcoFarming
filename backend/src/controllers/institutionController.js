const { db } = require('../config/firebase');

const registerInstitution = async (req, res) => {
    try {
        const { institutionName, type, registrationId, contactPerson, email, phone, address, website } = req.body;

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
            process.env.JWT_SECRET || 'fallback_secret',
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

module.exports = {
    registerInstitution,
    loginInstitution
};
