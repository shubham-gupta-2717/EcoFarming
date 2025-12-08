const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load env
dotenv.config({ path: path.join(__dirname, 'backend/.env') });

console.log('Testing Firestore Connection...');
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);

try {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            })
        });
    }

    const db = admin.firestore();

    async function testConnection() {
        try {
            console.log('Attempting to read from "users" collection...');
            const snapshot = await db.collection('users').limit(1).get();
            console.log('Success! Documents found:', snapshot.size);
            process.exit(0);
        } catch (error) {
            console.error('Firestore Connection Failed:', error);
            process.exit(1);
        }
    }

    testConnection();

} catch (e) {
    console.error('Initialization Error:', e);
}
