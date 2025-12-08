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
        const {
            cropName,
            sowingDate,
            landSize,
            area,
            cropVariety,
            irrigationType,
            farmingType,
            notes,
            startingStage // Optional: user defines starting stage (1-indexed)
        } = req.body;

        if (!cropName || !sowingDate || (!landSize && !area)) {
            return res.status(400).json({ message: 'Crop name, sowing date, and area/land size are required' });
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

        // Add new crop with Pipeline support
        const newCrop = {
            cropName,
            sowingDate, // Store as ISO string YYYY-MM-DD
            landSize: parseFloat(area || landSize),
            area: parseFloat(area || landSize),
            cropVariety: cropVariety || '',
            irrigationType: irrigationType || 'Rainfed',
            farmingType: farmingType || 'Conventional',
            notes: notes || '',
            status: 'active',
            // PIPELINE FIELDS
            currentStage: startingStage ? parseInt(startingStage) : 1, // Default to Stage 1
            completedStages: [], // Will be auto-filled if starting > 1
            createdAt: new Date().toISOString()
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
        // Note: We don't update startingStage here as it's an initialization field
        const { cropName, sowingDate, landSize, area, cropVariety, irrigationType, farmingType, notes } = req.body;

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
        const currentCrop = crops[cropIndex];
        crops[cropIndex] = {
            ...currentCrop,
            cropName: cropName || oldCropName,
            sowingDate: sowingDate || currentCrop.sowingDate,
            landSize: (area || landSize) ? parseFloat(area || landSize) : currentCrop.landSize,
            area: (area || landSize) ? parseFloat(area || landSize) : (currentCrop.area || currentCrop.landSize),
            cropVariety: cropVariety !== undefined ? cropVariety : (currentCrop.cropVariety || ''),
            irrigationType: irrigationType || currentCrop.irrigationType || 'Rainfed',
            farmingType: farmingType || currentCrop.farmingType || 'Conventional',
            notes: notes !== undefined ? notes : (currentCrop.notes || '')
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
        const initialLength = crops.length;

        // Case-insensitive filtering to ensure deleting "Potato" works even if requested as "potato"
        crops = crops.filter(c => c.cropName.toLowerCase() !== cropName.toLowerCase());

        if (crops.length === initialLength) {
            console.log(`[UserId: ${userId}] Crop deletion warning: '${cropName}' not found in user crops.`);
            // We still return success with current list to sync frontend, but maybe log it.
        }

        await userRef.update({ crops });
        console.log(`[UserId: ${userId}] Deleted crop '${cropName}'. remaining: ${crops.length}`);

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

        // Extract institute ID for easier querying
        const fulfillingInstituteId = order.fulfillingInstitute?.id || null;

        // Extract address for easier display in admin panel
        const customerAddress = order.fulfillmentType === 'delivery' && order.deliveryDetails
            ? `${order.deliveryDetails.street}, ${order.deliveryDetails.city}, ${order.deliveryDetails.state} - ${order.deliveryDetails.zip}`
            : null;

        const customerPhone = order.fulfillmentType === 'delivery' && order.deliveryDetails
            ? order.deliveryDetails.phone
            : (userData.phone || userData.mobile || '');

        // Save to central 'orders' collection for Admin Management
        await db.collection('orders').doc(order.id).set({
            ...order,
            userId: userId,
            fulfillingInstituteId: fulfillingInstituteId, // Add for filtering
            customerName: userData.name || 'Unknown',
            customerEmail: userData.email || '',
            customerAddress: customerAddress, // Formatted address for delivery orders
            customerPhone: customerPhone, // Contact phone number
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
