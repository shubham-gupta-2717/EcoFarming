const { admin } = require('../config/firebase');

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        if (admin) {
            const decodedToken = await admin.auth().verifyIdToken(token);
            req.user = decodedToken;
            next();
        } else {
            // Mock auth for development if Firebase is not set up
            if (process.env.NODE_ENV === 'development') {
                req.user = { uid: 'mock-user-id', email: 'test@example.com' };
                next();
            } else {
                return res.status(500).json({ message: 'Firebase not initialized' });
            }
        }
    } catch (error) {
        console.error('Auth Error:', error);
        return res.status(403).json({ message: 'Invalid token' });
    }
};

module.exports = verifyToken;
