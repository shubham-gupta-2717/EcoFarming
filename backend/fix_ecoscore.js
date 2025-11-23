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

async function fixEcoScore() {
    try {
        console.log("Scanning users for missing ecoScore...");
        const snapshot = await db.collection('users').get();

        let updatedCount = 0;
        const batch = db.batch();

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.ecoScore === undefined || data.ecoScore === null) {
                console.log(`Fixing user: ${data.name || 'Unknown'} (${doc.id}) - Missing ecoScore`);
                batch.update(doc.ref, {
                    ecoScore: 0,
                    badges: data.badges || [],
                    credits: data.credits || 0,
                    completedMissions: data.completedMissions || 0
                });
                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            await batch.commit();
            console.log(`Successfully updated ${updatedCount} users.`);
        } else {
            console.log("All users already have ecoScore.");
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

fixEcoScore();
