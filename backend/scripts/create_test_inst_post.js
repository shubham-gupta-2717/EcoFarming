require('dotenv').config({ path: 'backend/.env' });
const { db, admin } = require('../src/config/firebase');

async function createTestPost() {
    console.log('--- Creating Test Post for Institution ---');
    try {
        // Get the institution we just created/updated
        const snapshot = await db.collection('institutions').limit(1).get();
        if (snapshot.empty) {
            console.log('No institutions found.');
            return;
        }
        const instId = snapshot.docs[0].id;
        const instData = snapshot.docs[0].data();
        console.log(`Institution: ${instData.institutionName} (${instId})`);

        // Create a post WITHOUT structured location data
        const postRef = await db.collection('communityPosts').add({
            author: instData.institutionName,
            authorId: instId,
            content: 'This is a test post from an institution to verify backfill.',
            userType: 'institution',
            likes: 0,
            comments: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            // Only old-style location
            location: 'Old Address'
        });

        console.log(`Created post ${postRef.id} without structured location.`);

    } catch (error) {
        console.error('Error:', error);
    }
}

createTestPost();
