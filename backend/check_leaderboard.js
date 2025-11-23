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

async function checkRamesh() {
    try {
        console.log("Searching for user with name 'rAMEsh(dont change)'...");
        const snapshot = await db.collection('users').where('name', '==', 'rAMEsh(dont change)').get();

        if (snapshot.empty) {
            console.log("No user found with name 'rAMEsh(dont change)'.");
        } else {
            snapshot.forEach(doc => {
                console.log('User Found:', doc.id, doc.data());
            });
        }

        console.log("\nChecking ALL users in leaderboard (orderBy ecoScore desc)...");
        const leaderboardSnapshot = await db.collection('users')
            .orderBy('ecoScore', 'desc')
            .get();

        console.log(`Total users found: ${leaderboardSnapshot.size}`);
        leaderboardSnapshot.forEach(doc => {
            console.log(`Ranked User: ${doc.data().name} (Score: ${doc.data().ecoScore}) - ID: ${doc.id}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

checkRamesh();
