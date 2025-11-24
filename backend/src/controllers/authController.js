const { admin, db } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory user store (Farmers)
// Key: mobile number
const userStore = new Map();

// In-memory admin store
// Key: email
const adminStore = new Map();

// Initialize with demo user
userStore.set('9876543210', {
    uid: 'demo-user-1',
    mobile: '9876543210',
    name: 'Demo Farmer',
    role: 'farmer',
    location: 'Demo Location',
    crop: 'Demo Crop'
});

// Initialize with user's test number
userStore.set('9334329600', {
    uid: 'test-user-2',
    mobile: '9334329600',
    name: 'Test Farmer',
    role: 'farmer',
    location: 'Bihar',
    crop: 'Rice'
});

// Initialize with demo admin (Password: admin123)
// In a real app, this would be in a database
const seedAdmin = async () => {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    adminStore.set('admin@ecofarming.com', {
        uid: 'admin-user-1',
        email: 'admin@ecofarming.com',
        password: hashedPassword,
        name: 'System Admin',
        role: 'admin'
    });
    console.log('🌱 Demo Admin Initialized: admin@ecofarming.com / admin123');
};
seedAdmin();

const generateToken = (user) => {
    return jwt.sign(
        { uid: user.uid, role: user.role, mobile: user.mobile, email: user.email, name: user.name },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '7d' }
    );
};

// FARMER LOGIN (Phone OTP)
const verifyFarmerLogin = async (req, res) => {
    const { idToken } = req.body;

    console.log("Received login request");

    if (!idToken) {
        return res.status(400).json({ message: 'ID Token is required' });
    }

    try {
        // Verify the ID token using Firebase Admin SDK
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const rawMobile = decodedToken.phone_number;

        console.log(`Raw mobile from token: ${rawMobile}`);

        if (!rawMobile) {
            return res.status(400).json({ message: 'Phone number not found in token' });
        }

        // Normalize: Remove all non-digit characters
        const digits = rawMobile.replace(/\D/g, '');
        // Take the last 10 digits
        const mobile = digits.slice(-10);

        console.log(`Normalized mobile: ${mobile}`);

        const uid = decodedToken.uid;

        let user = null;

        // 1. Check Firestore by UID (Primary Source of Truth)
        const userDoc = await db.collection('users').doc(uid).get();

        // Capture memory user BEFORE overwriting it, to check for old posts
        const memoryUser = userStore.get(mobile);

        if (userDoc.exists) {
            user = userDoc.data();

            // Check if we need to migrate posts from the old memory UID (e.g. 'test-user-2')
            if (memoryUser && memoryUser.uid !== user.uid) {
                const oldUid = memoryUser.uid;
                const postsSnapshot = await db.collection('communityPosts').where('authorId', '==', oldUid).get();

                if (!postsSnapshot.empty) {
                    const batch = db.batch();
                    postsSnapshot.forEach(doc => {
                        batch.update(doc.ref, { authorId: user.uid });
                    });
                    await batch.commit();
                }
            }

            // Ensure mobile number is present (backfill if missing)
            if (!user.mobile) {
                console.log(`[Login] Backfilling missing mobile number for ${uid}: ${mobile}`);
                user.mobile = mobile;
                await db.collection('users').doc(uid).update({ mobile });
            }

            // Update in-memory store
            userStore.set(mobile, user);
        } else {
            // 2. Fallback to Memory (only if not found in DB)
            user = userStore.get(mobile);
            if (user) {
                console.log('User found in Memory Store. Checking for orphaned data...');

                // Check if there is data saved under the OLD test UID (e.g. 'test-user-2')
                const oldUid = user.uid;
                if (oldUid && oldUid !== uid) {
                    const oldUserDoc = await db.collection('users').doc(oldUid).get();
                    if (oldUserDoc.exists) {
                        console.log(`Found orphaned data for ${oldUid}. Migrating to ${uid}...`);
                        // Use the data from Firestore (which has the updated name/location)
                        user = oldUserDoc.data();
                    }
                }

                // Update UID to the real Firebase UID so updates go to the right place
                user.uid = uid;
                // Save to Firestore so it persists and is found next time
                await db.collection('users').doc(uid).set(user);
                console.log(`Migrated user to Firestore with UID: ${uid}`);
            }
        }

        if (!user) {
            console.log(`User not found for mobile: ${mobile}. Available keys: ${Array.from(userStore.keys()).join(', ')}`);
            return res.status(404).json({
                message: `User not found for number: ${mobile}. Please register first.`,
                isNewUser: true,
                debugMobile: mobile
            });
        }

        // Force role check (though verifyToken implies farmer flow usually)
        if (user.role !== 'farmer') {
            return res.status(403).json({ message: 'Access denied. Not a farmer account.' });
        }

        // Generate Session Token (JWT)
        const token = generateToken(user);

        res.json({
            success: true,
            token,
            user
        });

    } catch (error) {
        console.error("Token verification failed:", error);
        res.status(401).json({ message: 'Invalid Token', error: error.message });
    }
};

// ADMIN LOGIN (Email + Password)
const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    console.log(`[AdminLogin] Attempt for email: ${email}`);

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const adminUser = adminStore.get(email);

    if (!adminUser) {
        console.log(`[AdminLogin] User not found in adminStore. Available keys: ${Array.from(adminStore.keys()).join(', ')}`);
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);

    if (!isMatch) {
        console.log(`[AdminLogin] Password mismatch for ${email}`);
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`[AdminLogin] Success for ${email}`);
    const token = generateToken(adminUser);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = adminUser;

    res.json({
        success: true,
        token,
        user: userWithoutPassword
    });
};

// CREATE ADMIN (Protected / Internal)
const createAdmin = async (req, res) => {
    const { email, password, name, secret } = req.body;

    // Simple protection
    if (secret !== process.env.ADMIN_SECRET && secret !== 'eco_admin_secret') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    if (adminStore.has(email)) {
        return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = {
        uid: `admin-${Date.now()}`,
        email,
        password: hashedPassword,
        name,
        role: 'admin'
    };

    adminStore.set(email, newAdmin);

    res.json({ message: 'Admin created successfully' });
};

const register = async (req, res) => {
    const { mobile, name, role, location, crop, idToken } = req.body;

    try {
        if (!mobile || !name || !idToken) {
            return res.status(400).json({ message: 'Mobile, name, and ID Token are required' });
        }

        // Normalize mobile to last 10 digits
        const digits = mobile.replace(/\D/g, '');
        const normalizedMobile = digits.slice(-10);

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;

        // Check if user already exists in Firestore
        const userDoc = await db.collection('users').doc(uid).get();
        if (userDoc.exists) {
            return res.status(400).json({ message: 'User already registered' });
        }

        const newUser = {
            uid,
            mobile: normalizedMobile,
            name,
            role: role || 'farmer',
            location: location || '',
            crop: crop || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            credits: 0,
            ecoScore: 0,
            currentStreakDays: 0,
            longestStreakDays: 0,
            badges: [],
            learningModulesCompleted: 0
        };

        // Save to Firestore
        await db.collection('users').doc(uid).set(newUser);

        // Update in-memory store for backward compatibility/cache
        userStore.set(normalizedMobile, newUser);

        const token = generateToken(newUser);

        res.json({
            message: 'User registered successfully',
            token,
            user: newUser
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.uid;
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user: userDoc.data() });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.uid;
        const { email, name, location } = req.body;

        const updates = {};
        if (email) updates.email = email;
        if (name) updates.name = name;
        if (location) updates.location = location;

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Use set with merge: true to handle cases where document might be missing
        await db.collection('users').doc(userId).set(updates, { merge: true });

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: { ...req.user, ...updates }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { verifyFarmerLogin, adminLogin, createAdmin, register, getProfile, updateProfile };
