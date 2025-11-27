require('dotenv').config({ path: 'backend/.env' });
const { db, admin } = require('../src/config/firebase');

async function testSubDistrict() {
    console.log('--- Testing SubDistrict Query ---');
    try {
        const snapshot = await db.collection('users')
            .where('subDistrict', '==', 'Hisua')
            .orderBy('ecoScore', 'desc')
            .get();

        console.log(`Query: where('subDistrict', '==', 'Hisua').orderBy('ecoScore', 'desc')`);
        console.log(`Found ${snapshot.size} users.`);

        snapshot.forEach(doc => {
            console.log(`- ${doc.id}: ${doc.data().name} (${doc.data().ecoScore})`);
        });

        if (snapshot.empty) {
            console.log('Query returned EMPTY. Checking without orderBy...');
            const snapshotNoOrder = await db.collection('users')
                .where('subDistrict', '==', 'Hisua')
                .get();
            console.log(`Found ${snapshotNoOrder.size} users WITHOUT orderBy.`);
            snapshotNoOrder.forEach(doc => {
                console.log(`- ${doc.id}: ${doc.data().name} (${doc.data().ecoScore})`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

testSubDistrict();
