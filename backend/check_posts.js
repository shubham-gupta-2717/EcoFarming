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

async function checkPosts() {
    try {
        console.log("Fetching all community posts...");
        const snapshot = await db.collection('communityPosts').get();

        console.log(`Found ${snapshot.size} posts.`);
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`Post ID: ${doc.id}`);
            console.log(`- Author: ${data.author} (${data.userType})`);
            console.log(`- MediaType: ${data.mediaType}`);
            console.log(`- Likes: ${data.likes}`);
            console.log('---');
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

checkPosts();
