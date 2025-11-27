require('dotenv').config({ path: 'backend/.env' });
const { db, admin } = require('../src/config/firebase');

async function backfillUserPosts() {
    console.log('--- Backfilling Posts for shubham(checking) ---');
    try {
        // 1. Get User Data
        const userSnapshot = await db.collection('users').where('name', '==', 'shubham(checking)').get();
        if (userSnapshot.empty) {
            console.log('User shubham(checking) not found.');
            return;
        }
        const userDoc = userSnapshot.docs[0];
        const userId = userDoc.id;
        const userData = userDoc.data();

        console.log(`User Found: ${userData.name}`);
        console.log(`Location: ${userData.state}, ${userData.district}, ${userData.subDistrict}`);

        if (!userData.state) {
            console.log('User has no state set. Cannot backfill.');
            return;
        }

        // 2. Get User's Posts
        const postsSnapshot = await db.collection('communityPosts').where('authorId', '==', userId).get();
        console.log(`Found ${postsSnapshot.size} posts to update.`);

        // 3. Update Posts
        const batch = db.batch();
        postsSnapshot.forEach(doc => {
            const postRef = db.collection('communityPosts').doc(doc.id);
            batch.update(postRef, {
                state: userData.state,
                district: userData.district,
                subDistrict: userData.subDistrict,
                village: userData.village || null,
                location: `${userData.village || ''}, ${userData.subDistrict || ''}, ${userData.district || ''}, ${userData.state || ''}`
            });
        });

        await batch.commit();
        console.log('Successfully updated posts with location data.');

    } catch (error) {
        console.error('Error:', error);
    }
}

backfillUserPosts();
