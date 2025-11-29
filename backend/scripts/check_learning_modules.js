require('dotenv').config({ path: 'backend/.env' });
const { db } = require('../src/config/firebase');

async function checkModules() {
    console.log('--- Checking Learning Modules ---');
    try {
        const snapshot = await db.collection('learningModules').get();
        console.log(`Found ${snapshot.size} modules.\n`);

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`Module ID: ${doc.id}`);
            console.log(`- Title: ${data.title}`);
            console.log(`- Category: ${data.category}`);
            console.log(`- Has createdAt: ${!!data.createdAt}`);
            console.log(`- createdAt value: ${data.createdAt}`);
            console.log('---');
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

checkModules();
