require('dotenv').config({ path: 'backend/.env' });
const { db, admin } = require('../src/config/firebase');

async function updateTestInstitution() {
    console.log('--- Updating Test Institution Location ---');
    try {
        const snapshot = await db.collection('institutions').limit(1).get();
        if (snapshot.empty) {
            console.log('No institutions found. Creating one...');
            const newInstRef = db.collection('institutions').doc();
            await newInstRef.set({
                institutionName: 'Test Institute',
                address: 'Old Address',
                contactPerson: 'Tester',
                type: 'NGO'
            });
            console.log(`Created new institution: ${newInstRef.id}`);
            // Re-fetch
            const snapshot2 = await db.collection('institutions').limit(1).get();
            const instRef = snapshot2.docs[0].ref;
            await instRef.update({
                state: 'BIHAR',
                district: 'Nawada',
                subDistrict: 'Hisua',
                village: 'Test Village',
                address: 'Test Village, Hisua, Nawada, BIHAR'
            });
            console.log(`Updated institution ${instRef.id} with location data.`);
            return;
        }
        const instRef = snapshot.docs[0].ref;
        console.log(`Updating Institution ID: ${snapshot.docs[0].id}`);
        await instRef.update({
            state: 'BIHAR',
            district: 'Nawada',
            subDistrict: 'Hisua',
            village: 'Test Village',
            address: 'Test Village, Hisua, Nawada, BIHAR'
        });

        console.log(`Updated institution ${instId} with location data.`);

    } catch (error) {
        console.error('Error:', error);
    }
}

updateTestInstitution();
