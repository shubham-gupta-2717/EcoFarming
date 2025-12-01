const { db } = require('../src/config/firebase');

async function syncOrders() {
    try {
        console.log('🔄 Starting order sync...');

        // Get all users
        const usersSnapshot = await db.collection('users').get();
        console.log(`👥 Found ${usersSnapshot.size} users`);

        let totalOrders = 0;
        let syncedOrders = 0;

        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const userId = userDoc.id;

            if (userData.orders && Array.isArray(userData.orders) && userData.orders.length > 0) {
                console.log(`📦 Processing ${userData.orders.length} orders for user ${userData.name || userId}`);

                for (const order of userData.orders) {
                    totalOrders++;

                    // Always update/set the order to ensure customer details are present
                    const orderRef = db.collection('orders').doc(order.id);

                    // Generate a display ID if not present
                    const displayId = order.id.startsWith('ORD-') ? order.id : `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                    // Recalculate total if 0 or missing
                    let total = order.total || order.amount || 0;
                    if (total === 0 && Array.isArray(order.items)) {
                        total = order.items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity || 1)), 0);
                    }

                    await orderRef.set({
                        ...order,
                        userId: userId,
                        customerName: userData.name || 'Unknown',
                        customerEmail: userData.email || '',
                        displayId: order.displayId || displayId,
                        total: total,
                        syncedAt: new Date()
                    }, { merge: true });

                    syncedOrders++;
                    process.stdout.write('.');
                }
            }
        }

        console.log('\n\n✅ Sync Complete!');
        console.log(`Total Orders Found: ${totalOrders}`);
        console.log(`New Orders Synced: ${syncedOrders}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error syncing orders:', error);
        process.exit(1);
    }
}

syncOrders();
