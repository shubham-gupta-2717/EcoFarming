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

async function backfillPosts() {
    try {
        console.log("Scanning posts for missing fields...");
        const snapshot = await db.collection('communityPosts').get();

        let updatedCount = 0;
        const batch = db.batch();

        snapshot.forEach(doc => {
            const data = doc.data();
            let needsUpdate = false;
            const updates = {};

            if (!data.userType) {
                updates.userType = 'farmer';
                needsUpdate = true;
            }

            if (data.mediaType === undefined) {
                updates.mediaType = null;
                needsUpdate = true;
            }

            if (data.likes === undefined) {
                updates.likes = 0;
                needsUpdate = true;
            }

            if (needsUpdate) {
                console.log(`Updating post ${doc.id}...`);
                batch.update(doc.ref, updates);
                updatedCount++;
            }
        });

        if (updatedCount > 0) {
            await batch.commit();
            console.log(`Successfully updated ${updatedCount} posts.`);
        } else {
            console.log("All posts are up to date.");
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

backfillPosts();
