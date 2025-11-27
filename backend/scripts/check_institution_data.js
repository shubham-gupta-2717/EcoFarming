require('dotenv').config({ path: 'backend/.env' });
const { db, admin } = require('../src/config/firebase');

async function checkInstitutionData() {
    console.log(`Project ID: ${process.env.FIREBASE_PROJECT_ID}`);
    console.log('--- Checking Institution Data ---');
    try {
        const usersSnapshot = await db.collection('users').limit(1).get();
        console.log(`Found ${usersSnapshot.size} users.`);

        const snapshot = await db.collection('institutions').get();
        console.log(`Found ${snapshot.size} institutions.`);

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`\nInstitution ID: ${doc.id}`);
            console.log(`- Name: ${data.institutionName}`);
            console.log(`- Address: '${data.address}'`);
            console.log(`- State: '${data.state}'`);
            console.log(`- District: '${data.district}'`);
            console.log(`- SubDistrict: '${data.subDistrict}'`);
            console.log(`- Village: '${data.village}'`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

checkInstitutionData();
