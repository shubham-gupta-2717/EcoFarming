const admin = require('firebase-admin');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

const db = admin.firestore();

async function checkUser() {
    try {
        console.log('Searching for user with mobile: 9334329600');
        const snapshot = await db.collection('users').where('mobile', '==', '9334329600').get();

        if (snapshot.empty) {
            console.log('No user found with this mobile number.');
        } else {
            snapshot.forEach(doc => {
                console.log('User Found:', doc.id, doc.data());
            });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUser();
