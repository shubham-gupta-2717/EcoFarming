require('dotenv').config({ path: 'backend/.env' });
const { db, admin } = require('../src/config/firebase');

async function checkUserPosts() {
    console.log('--- Checking Posts by shubham(checking) ---');
    try {
        // First find the user ID
        const userSnapshot = await db.collection('users').where('name', '==', 'shubham(checking)').get();
        if (userSnapshot.empty) {
            console.log('User shubham(checking) not found.');
            return;
        }
        const userId = userSnapshot.docs[0].id;
        console.log(`User ID: ${userId}`);

        const postsSnapshot = await db.collection('communityPosts').where('authorId', '==', userId).get();
        console.log(`Found ${postsSnapshot.size} posts by this user.`);

        postsSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`- Post ID: ${doc.id}, State: ${data.state}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

checkUserPosts();
