const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { verifyToken } = require('../middleware/authMiddleware');

// Protect all routes
router.use(verifyToken);

/**
 * Get user's crops
 */
router.get('/crops', async (req, res) => {
    try {
        const userId = req.user.uid;
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.json({ crops: [] });
        }

        const userData = userDoc.data();
        res.json({ crops: userData.crops || [] });
    } catch (error) {
        console.error('Error fetching crops:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * Add a new crop
 */
router.post('/crops', async (req, res) => {
    try {
        const userId = req.user.uid;
        const { cropName, stage, landSize } = req.body;

        if (!cropName || !stage || !landSize) {
            return res.status(400).json({ message: 'Crop name, stage, and land size are required' });
        }

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        let crops = [];
        if (userDoc.exists) {
            crops = userDoc.data().crops || [];
        }

        // Check if crop already exists
        if (crops.some(c => c.cropName === cropName)) {
            return res.status(400).json({ message: 'Crop already exists' });
        }

        // Add new crop
        const newCrop = {
            cropName,
            stage,
            landSize: parseFloat(landSize)
        };

        crops.push(newCrop);

        if (userDoc.exists) {
            await userRef.update({ crops });
        } else {
            await userRef.set({ crops, uid: userId });
        }

        res.json({ message: 'Crop added successfully', crops });
    } catch (error) {
        console.error('Error adding crop:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * Update a crop
 */
router.put('/crops/:cropName', async (req, res) => {
    try {
        const userId = req.user.uid;
        const oldCropName = req.params.cropName;
        const { cropName, stage, landSize } = req.body;

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        let crops = userDoc.data().crops || [];
        const cropIndex = crops.findIndex(c => c.cropName === oldCropName);

        if (cropIndex === -1) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        // Update crop
        crops[cropIndex] = {
            cropName: cropName || oldCropName,
            stage: stage || crops[cropIndex].stage,
            landSize: landSize ? parseFloat(landSize) : crops[cropIndex].landSize
        };

        await userRef.update({ crops });

        res.json({ message: 'Crop updated successfully', crops });
    } catch (error) {
        console.error('Error updating crop:', error);
        res.status(500).json({ message: error.message });
    }
});

/**
 * Delete a crop
 */
router.delete('/crops/:cropName', async (req, res) => {
    try {
        const userId = req.user.uid;
        const cropName = req.params.cropName;

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        let crops = userDoc.data().crops || [];
        crops = crops.filter(c => c.cropName !== cropName);

        await userRef.update({ crops });

        res.json({ message: 'Crop deleted successfully', crops });
    } catch (error) {
        console.error('Error deleting crop:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
