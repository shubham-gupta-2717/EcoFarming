const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

// Load env from backend root
dotenv.config({ path: path.join(__dirname, '../.env') });

if (!process.env.FIREBASE_PRIVATE_KEY) {
    console.error('FIREBASE_PRIVATE_KEY is missing in .env');
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
});

const db = admin.firestore();

async function patchUser() {
    const userId = 'SED3LBYAFBSmEBf32OTFuMSpx7C3';
    console.log(`Patching user ${userId}...`);

    try {
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();

        if (!doc.exists) {
            console.log('User not found.');
            return;
        }

        const data = doc.data();
        if (!data.name) {
            await userRef.update({
                name: 'Farmer',
                email: 'farmer@example.com',
                role: 'farmer',
                location: 'India',
                credits: 0,
                ecoScore: 0
            });
            console.log('User patched successfully.');
        } else {
            console.log('User already has a name:', data.name);
        }
    } catch (error) {
        console.error('Error patching user:', error);
    }
}

patchUser().catch(console.error);
