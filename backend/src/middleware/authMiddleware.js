const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    try {
        // Verify JWT
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        req.user = verified;
        next();
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(400).json({ message: 'Invalid Token' });
    }
};

const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access Denied. Insufficient permissions.' });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRole };
