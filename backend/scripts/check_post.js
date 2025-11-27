require('dotenv').config({ path: 'backend/.env' });
const { db, admin } = require('../src/config/firebase');

async function checkPost() {
    console.log('--- Checking Post pfrwOpehFl1kXCTCxY3K ---');
    try {
        const doc = await db.collection('communityPosts').doc('pfrwOpehFl1kXCTCxY3K').get();
        const data = doc.data();
        console.log(`State: ${data.state}`);
        console.log(`District: ${data.district}`);
        console.log(`SubDistrict: ${data.subDistrict}`);
        console.log(`Institution Type: ${data.institutionType}`);
    } catch (error) {
        console.error('Error:', error);
    }
}

checkPost();
