require('dotenv').config({ path: 'backend/.env' });
const { db, admin } = require('../src/config/firebase');

async function checkCommunityData() {
    console.log('--- Checking Community Posts Data ---');
    try {
        const snapshot = await db.collection('communityPosts').limit(10).get();
        console.log(`Found ${snapshot.size} posts.`);

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`\nPost ID: ${doc.id}`);
            console.log(`- Author: ${data.author}`);
            console.log(`- State: '${data.state}'`);
            console.log(`- District: '${data.district}'`);
            console.log(`- SubDistrict: '${data.subDistrict}'`);
            console.log(`- Location (string): '${data.location}'`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

checkCommunityData();
