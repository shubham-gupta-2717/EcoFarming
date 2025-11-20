const { admin } = require('../config/firebase');

// In-memory user store for development/testing
// TODO: For production, replace with proper database (Firebase Firestore, MongoDB, etc.)
// TODO: Add password hashing using bcrypt before storing passwords
const userStore = new Map();

// Initialize with demo user
userStore.set('demo@ecofarming.com', {
    uid: 'demo-user-1',
    email: 'demo@ecofarming.com',
    password: 'demo123', // TODO: Hash this password
    name: 'Demo Farmer',
    role: 'farmer',
    location: 'Demo Location',
    crop: 'Demo Crop'
});

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check in-memory user store first
        const user = userStore.get(email);

        if (user && user.password === password) {
            // TODO: Generate proper JWT token instead of mock token
            const token = `mock-jwt-token-${Date.now()}`;

            // Return user data without password
            const { password: _, ...userWithoutPassword } = user;

            return res.json({
                token,
                user: userWithoutPassword
            });
        }

        // If using real Firebase Auth, the client sends a token to verify
        const token = req.headers.authorization?.split(' ')[1];
        if (token && admin) {
            const decodedToken = await admin.auth().verifyIdToken(token);
            return res.json({ token, user: decodedToken });
        }

        res.status(401).json({ message: 'Invalid credentials' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const register = async (req, res) => {
    const { email, password, name, role, location, crop } = req.body;

    try {
        // Validate required fields
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Email, password, and name are required' });
        }

        // Check if user already exists
        if (userStore.has(email)) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Create new user
        // TODO: Hash password before storing using bcrypt
        const newUser = {
            uid: `user-${Date.now()}`,
            email,
            password, // TODO: Hash this
            name,
            role: role || 'farmer',
            location: location || '',
            crop: crop || '',
            createdAt: new Date().toISOString()
        };

        // Store user
        userStore.set(email, newUser);

        // Return success without password
        const { password: _, ...userWithoutPassword } = newUser;

        res.json({
            message: 'User registered successfully',
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    // req.user is set by authMiddleware
    res.json({ user: req.user });
};

module.exports = { login, register, getProfile };
