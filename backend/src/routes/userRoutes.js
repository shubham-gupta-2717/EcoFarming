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
            // Create full user document if it doesn't exist
            const newUser = {
                uid: userId,
                crops,
                name: req.user.name || 'Farmer',
                email: req.user.email || '',
                role: req.user.role || 'farmer',
                mobile: req.user.mobile || '',
                location: 'India',
                createdAt: new Date(),
                credits: 0,
                ecoScore: 0
            };
            await userRef.set(newUser);
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

/**
 * Add a new order
 */
router.post('/orders', async (req, res) => {
    try {
        const userId = req.user.uid;
        const { order } = req.body;

        if (!order) {
            return res.status(400).json({ message: 'Order data is required' });
        }

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = userDoc.data();
        let orders = userData.orders || [];

        // Add new order to user's list
        orders.unshift(order); // Add to beginning of array

        const updates = { orders };

        // Handle credits deduction if applicable
        if (order.discount && order.discount > 0) {
            const currentCredits = userData.credits || 0;
            const newCredits = Math.max(0, currentCredits - order.discount);
            updates.credits = newCredits;

            // Add transaction record
            let transactions = userData.transactions || [];
            transactions.unshift({
                id: Date.now(),
                type: 'debit',
                amount: order.discount,
                description: `Store Purchase - ${order.id}`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
            });
            updates.transactions = transactions;
        }

        await userRef.update(updates);

        // Save to central 'orders' collection for Admin Management
        await db.collection('orders').doc(order.id).set({
            ...order,
            userId: userId,
            customerName: userData.name || 'Unknown',
            customerEmail: userData.email || '',
            createdAt: new Date()
        });

        res.json({
            message: 'Order placed successfully',
            orders,
            credits: updates.credits,
            transactions: updates.transactions
        });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
