const express = require('express');
const router = express.Router();
const { getWeatherData } = require('../services/weatherService');
const { verifyToken } = require('../middleware/authMiddleware');

/**
 * Get current weather for a location
 */
router.get('/current', verifyToken, async (req, res) => {
    try {
        const location = req.query.location || req.user.location || 'India';
        const weatherData = await getWeatherData(location);

        res.json({
            success: true,
            location: weatherData.location,
            current: weatherData.current,
            forecast: weatherData.forecast.slice(0, 3) // Next 3 days
        });
    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * Get alerts for a location
 */
router.get('/alerts', verifyToken, async (req, res) => {
    try {
        const location = req.query.location || req.user.location || 'India';
        const weatherData = await getWeatherData(location);

        res.json({
            success: true,
            alerts: weatherData.alerts
        });
    } catch (error) {
        console.error('Weather alerts error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
