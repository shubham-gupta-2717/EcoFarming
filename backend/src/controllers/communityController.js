const { db, admin } = require('../config/firebase');

const getFeed = async (req, res) => {
    try {
        const postsRef = db.collection('communityPosts');
        const snapshot = await postsRef
            .orderBy('createdAt', 'desc')
            .limit(20)
            .get();

        const posts = [];
        const authorIds = new Set();

        snapshot.forEach(doc => {
            const data = doc.data();
            posts.push({
                id: doc.id,
                ...data,
                time: data.createdAt ? getTimeAgo(data.createdAt.toDate()) : 'Just now'
            });
            if (data.authorId) {
                authorIds.add(data.authorId);
            }
        });

        // Fetch user details for all authors
        const userMap = {};
        if (authorIds.size > 0) {
            const ids = Array.from(authorIds);
            const userRefs = ids.map(id => db.collection('users').doc(id).get());
            const userSnapshots = await Promise.all(userRefs);

            userSnapshots.forEach(doc => {
                if (doc.exists) {
                    userMap[doc.id] = doc.data();
                }
            });
        }

        // Enrich posts with latest user data
        const enrichedPosts = posts.map(post => {
            const user = userMap[post.authorId];
            console.log(`[GetFeed] Post ${post.id} AuthorId: ${post.authorId} UserFound: ${!!user} Name: ${user?.name}`);
            return {
                ...post,
                author: user?.name || post.author || 'Farmer',
                location: user?.location || post.location || 'India'
            };
        });

        res.json({ posts: enrichedPosts });
    } catch (error) {
        console.error('Error fetching feed:', error);
        res.status(500).json({ message: error.message });
    }
};

const createPost = async (req, res) => {
    try {
        const { content, image } = req.body;
        const userId = req.user.uid;

        // Get user details (name and location) from Firestore
        const userDoc = await db.collection('users').doc(userId).get();
        let userName = req.user.name;
        let userLocation = 'India';

        console.log(`[CreatePost] UserID: ${userId}`);
        console.log(`[CreatePost] Token Name: ${req.user.name}`);
        console.log(`[CreatePost] Firestore Exists: ${userDoc.exists}`);

        if (userDoc.exists) {
            const userData = userDoc.data();
            console.log(`[CreatePost] Firestore Name: ${userData.name}`);
            userName = userData.name || userName || 'Farmer';
            userLocation = userData.location || 'India';
        } else {
            userName = userName || 'Farmer';
        }

        const newPost = {
            author: userName,
            authorId: userId,
            location: userLocation,
            content,
            image: image || null,
            likes: 0,
            comments: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('communityPosts').add(newPost);

        res.json({
            success: true,
            message: 'Post created successfully',
            post: { id: docRef.id, ...newPost, time: 'Just now' }
        });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper function for time ago
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

const deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.uid;

        const postRef = db.collection('communityPosts').doc(postId);
        const postDoc = await postRef.get();

        if (!postDoc.exists) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const postData = postDoc.data();
        if (postData.authorId !== userId) {
            return res.status(403).json({ message: 'You can only delete your own posts' });
        }

        await postRef.delete();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getFeed, createPost, deletePost };
