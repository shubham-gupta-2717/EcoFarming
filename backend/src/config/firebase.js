const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

try {
    if (process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
        console.log('Firebase Admin Initialized');
    } else {
        console.warn('⚠️ FIREBASE_PRIVATE_KEY not found. Firebase features will not work.');
    }
} catch (error) {
    console.error('Firebase Initialization Error:', error);
}

const db = admin.apps.length > 0 ? admin.firestore() : null;

module.exports = { admin, db };
