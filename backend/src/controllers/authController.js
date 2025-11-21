const { admin } = require('../config/firebase');
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
        { uid: user.uid, role: user.role, mobile: user.mobile, email: user.email },
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

        // Check if user exists
        let user = userStore.get(mobile);

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

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const adminUser = adminStore.get(email);

    if (!adminUser) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, adminUser.password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

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

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const verifiedMobile = decodedToken.phone_number?.replace('+91', '') || decodedToken.phone_number;

        if (userStore.has(mobile)) {
            return res.status(400).json({ message: 'Mobile number already registered' });
        }

        const newUser = {
            uid: decodedToken.uid,
            mobile,
            name,
            role: role || 'farmer',
            location: location || '',
            crop: crop || '',
            createdAt: new Date().toISOString()
        };

        userStore.set(mobile, newUser);

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
    res.json({ user: req.user });
};

module.exports = { verifyFarmerLogin, adminLogin, createAdmin, register, getProfile };
