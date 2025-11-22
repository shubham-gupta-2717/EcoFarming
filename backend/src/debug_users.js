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

async function listData() {
    console.log('--- USERS ---');
    const usersSnapshot = await db.collection('users').get();
    usersSnapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
    });

    console.log('\n--- POSTS ---');
    const postsSnapshot = await db.collection('communityPosts').orderBy('createdAt', 'desc').limit(5).get();
    postsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`Post ${doc.id}: AuthorId=${data.authorId}, Author=${data.author}, Content=${data.content}`);
    });
}

listData().catch(console.error);
