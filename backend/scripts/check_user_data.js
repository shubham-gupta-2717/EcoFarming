const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { db } = require('../src/config/firebase');

async function run() {
    console.log('--- Checking User Data ---');
    try {
        const snapshot = await db.collection('users').get();
        if (snapshot.empty) {
            console.log('No users found.');
            return;
        }

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`User ID: ${doc.id}`);
            console.log(`Name: ${data.name}`);
            console.log(`Role: ${data.role}`);
            console.log(`EcoScore: ${data.ecoScore}`);
            console.log(`Location:`, {
                state: data.state,
                district: data.district,
                subDistrict: data.subDistrict,
                village: data.village,
                // Check for nested location object too
                nested: data.location
            });
            console.log(`Crops: ${data.crop}`);
            console.log('-----------------------------------');
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
    process.exit(0);
}

run();
