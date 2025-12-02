const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Initialize Firebase
// Note: We need to handle the case where the app is already initialized or use the existing config
// But for a standalone script, we usually need the service account. 
// Let's try to require the existing firebase config if possible, but that might be tied to the app structure.
// Instead, let's look at how other scripts do it or how the app does it.
// The app uses `backend/src/config/firebase.js`. Let's try to use that if it exports the db directly.

const { db } = require('../src/config/firebase');

async function cleanupAiModules() {
    console.log('Starting cleanup of AI-generated modules...');

    try {
        const modulesRef = db.collection('learningModules');
        const snapshot = await modulesRef.where('aiGenerated', '==', true).get();

        if (snapshot.empty) {
            console.log('No AI-generated modules found.');
            process.exit(0);
        }

        console.log(`Found ${snapshot.size} AI-generated modules. Deleting...`);

        const batch = db.batch();
        let count = 0;

        snapshot.forEach(doc => {
            batch.delete(doc.ref);
            count++;
        });

        await batch.commit();
        console.log(`Successfully deleted ${count} modules.`);
        process.exit(0);

    } catch (error) {
        console.error('Error cleaning up modules:', error);
        process.exit(1);
    }
}

cleanupAiModules();
