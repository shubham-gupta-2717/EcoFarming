const { db, admin } = require('../config/firebase');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

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

const getFeed = async (req, res) => {
    try {
        const { filter, limit, startAfter, state, district, subDistrict } = req.query;
        console.log(`[GetFeed] Request received. Filter: ${filter}, Limit: ${limit}, Location: ${state}/${district}/${subDistrict}`);
        const postsRef = db.collection('communityPosts');

        let query = postsRef;

        // Apply Location Filters
        if (state) query = query.where('state', '==', state);
        if (district) query = query.where('district', '==', district);
        if (subDistrict) query = query.where('subDistrict', '==', subDistrict);

        // Apply Sorting (Default to createdAt desc)
        // Note: This requires composite indexes if combined with 'where' clauses.
        // If index is missing, Firestore will throw an error with a link to create it.
        if (startAfter) {
            const lastDoc = await postsRef.doc(startAfter).get();
            if (lastDoc.exists) {
                query = query.startAfter(lastDoc);
            }
        }

        const snapshot = await query.get();

        let posts = [];
        const authorIds = new Set();

        snapshot.forEach(doc => {
            const data = doc.data();
            posts.push({
                id: doc.id,
                ...data,
                // Handle both Firestore Timestamp and Date objects safely
                time: data.createdAt ? getTimeAgo(data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : 'Just now',
                createdAt: data.createdAt // Keep specific field for sorting
            });
            if (data.authorId) {
                authorIds.add(data.authorId);
            }
        });

        console.log(`[Community] Fetched ${posts.length} posts from Firestore (Raw)`);

        // In-Memory Sorting (Newest First)
        posts.sort((a, b) => {
            const dateA = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : new Date(0);
            return dateB - dateA;
        });

        // In-Memory Filtering (Temporary fix for missing indexes)
        if (filter === 'photos') {
            posts = posts.filter(p => p.mediaType === 'image');
        } else if (filter === 'videos') {
            posts = posts.filter(p => p.mediaType === 'video');
        } else if (filter === 'institution') {
            posts = posts.filter(p => ['institution', 'admin'].includes(p.userType));
        } else if (filter === 'popular') {
            posts.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        }

        // Fetch user details for all authors
        const userMap = {};
        if (authorIds.size > 0) {
            const ids = Array.from(authorIds);
            // Firestore 'in' query supports up to 10 items, so we might need to batch or just fetch individually if many
            // For simplicity in this MVP, fetching individually or assuming not too many unique authors per page
            // Better approach: Use 'in' batches or just rely on stored author info if we trust it (but we want latest avatar/name)

            // Let's try to use the stored author info in the post for now to save reads, 
            // but if we want live updates we need to fetch.
            // Given the previous code fetched, let's keep fetching but maybe optimize later.

            const userRefs = ids.map(id => db.collection('users').doc(id).get());
            // Also check institutions collection if userType is institution
            // But wait, authorId for institution might be in 'institutions' collection?
            // The previous code assumed 'users'. Let's assume all 'users' (farmers) are in 'users'.
            // Institutions might be in 'institutions'.

            // We need to check where the author is.
            // If we stored userType, we can know.

            // For now, let's stick to the previous logic of fetching from 'users' 
            // AND also check 'institutions' if not found or if we know it's an institution.

            // Actually, let's just use the data stored in the post for simplicity and performance,
            // and only fetch if we really need to (e.g. for avatar updates).
            // The previous code fetched from 'users'.

            const userSnapshots = await Promise.all(userRefs);
            userSnapshots.forEach(doc => {
                if (doc.exists) {
                    userMap[doc.id] = doc.data();
                }
            });
        }

        // Enrich posts
        const enrichedPosts = posts.map(post => {
            const user = userMap[post.authorId];
            // If user not found in 'users' (maybe institution), fallback to post data
            return {
                ...post,
                author: user?.name || post.author || 'User',
                location: user?.location || post.location || '',
                state: user?.state || post.state || '',
                district: user?.district || post.district || '',
                subDistrict: user?.subDistrict || post.subDistrict || '',
                village: user?.village || post.village || '',
                userType: post.userType || 'farmer', // Default to farmer if missing
                institutionName: post.institutionName || null
            };
        });

        res.json({ posts: enrichedPosts });
    } catch (error) {
        console.error('Error fetching feed:', error);
        // Log to file
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(__dirname, '../../logs/error.log');
        const logMessage = `${new Date().toISOString()} - Error fetching community feed: ${error.message}\n`;
        try {
            if (!fs.existsSync(path.dirname(logPath))) fs.mkdirSync(path.dirname(logPath), { recursive: true });
            fs.appendFileSync(logPath, logMessage);
        } catch (e) { console.error('Failed to log to file', e); }

        res.status(500).json({ message: error.message });
    }
};

const createPost = async (req, res) => {
    try {
        const { content } = req.body;
        const userId = req.user.uid;
        const userRole = req.user.role || 'farmer'; // 'farmer', 'admin', 'institution'
        const file = req.file;

        // Get user details
        let userName = req.user.name;
        let userLocation = 'India';
        let institutionName = null;

        if (userRole === 'institution') {
            const instDoc = await db.collection('institutions').doc(userId).get();
            if (instDoc.exists) {
                const data = instDoc.data();
                userName = data.institutionName || userName;
                institutionName = data.institutionName;
                userLocation = data.address || 'India';

                // Capture institution type for tag display
                req.body.institutionType = data.type || 'Institution';

                // Capture structured location for institutions too
                if (data.state) req.body.state = data.state;
                if (data.district) req.body.district = data.district;
                if (data.subDistrict) req.body.subDistrict = data.subDistrict;
                if (data.village) req.body.village = data.village;
            }
        } else {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const data = userDoc.data();
                userName = data.name || userName || 'Farmer';
                userLocation = data.location || 'India';
                // Capture structured location
                if (data.state) req.body.state = data.state;
                if (data.district) req.body.district = data.district;
                if (data.subDistrict) req.body.subDistrict = data.subDistrict;
                if (data.village) req.body.village = data.village;
            }
        }

        let mediaUrl = null;
        let mediaType = null;

        // Handle file upload
        if (file) {
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'community_posts',
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                streamifier.createReadStream(file.buffer).pipe(uploadStream);
            });

            mediaUrl = result.secure_url;
            mediaType = result.resource_type;
        }

        const newPost = {
            author: userName,
            authorId: userId,
            userType: userRole,
            institutionName: institutionName,
            institutionType: req.body.institutionType || null,
            location: userLocation,
            state: req.body.state || null,
            district: req.body.district || null,
            subDistrict: req.body.subDistrict || null,
            village: req.body.village || null,
            content,
            mediaUrl,
            mediaType,
            likes: 0,
            likedBy: [],
            comments: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('communityPosts').add(newPost);

        // Award Points (Only for farmers)
        if (userRole === 'farmer') {
            const { awardPoints, POINTS_CONFIG } = require('../services/gamificationService');
            await awardPoints(
                userId,
                POINTS_CONFIG.COMMUNITY_SHARE,
                'community_post',
                'Shared a post in Community',
                docRef.id
            );
        }

        res.json({
            success: true,
            message: 'Post created successfully',
            post: { id: docRef.id, ...newPost, time: 'Just now' }
        });
    } catch (error) {
        console.error('[CreatePost] Error:', error);
        res.status(500).json({ message: error.message });
    }
};

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

        if (postData.authorId !== userId && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'You can only delete your own posts' });
        }

        await postRef.delete();
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: error.message });
    }
};

const toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.uid;

        const postRef = db.collection('communityPosts').doc(postId);

        await db.runTransaction(async (t) => {
            const postDoc = await t.get(postRef);
            if (!postDoc.exists) {
                throw new Error('Post not found');
            }

            const data = postDoc.data();
            const likedBy = data.likedBy || [];
            let likes = data.likes || 0;

            if (likedBy.includes(userId)) {
                // Unlike
                const index = likedBy.indexOf(userId);
                likedBy.splice(index, 1);
                likes = Math.max(0, likes - 1);
            } else {
                // Like
                likedBy.push(userId);
                likes++;
            }

            t.update(postRef, { likes, likedBy });
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error toggling like:', error);
        res.status(500).json({ message: error.message });
    }
};

const createReply = async (req, res) => {
    try {
        const { postId } = req.params;
        const { text } = req.body;
        const userId = req.user.uid;
        const userRole = req.user.role || 'farmer';

        if (!text) return res.status(400).json({ message: 'Reply text is required' });

        // Get user details
        let userName = req.user.name;
        let institutionName = null;

        if (userRole === 'institution') {
            const instDoc = await db.collection('institutions').doc(userId).get();
            if (instDoc.exists) {
                const data = instDoc.data();
                userName = data.contactPerson || userName;
                institutionName = data.institutionName;
            }
        } else {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                userName = userDoc.data().name || userName;
            }
        }

        const reply = {
            postId,
            userId,
            userName,
            userType: userRole,
            institutionName,
            text,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('community_replies').add(reply);

        // Increment comment count on post
        await db.collection('communityPosts').doc(postId).update({
            comments: admin.firestore.FieldValue.increment(1)
        });

        res.json({
            success: true,
            reply: { id: docRef.id, ...reply, time: 'Just now' }
        });
    } catch (error) {
        console.error('Error creating reply:', error);
        res.status(500).json({ message: error.message });
    }
};

const getReplies = async (req, res) => {
    try {
        const { postId } = req.params;
        const snapshot = await db.collection('community_replies')
            .where('postId', '==', postId)
            .get();

        let replies = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            replies.push({
                id: doc.id,
                ...data,
                time: data.createdAt ? getTimeAgo(data.createdAt.toDate()) : 'Just now'
            });
        });

        // Sort in memory (Oldest first)
        replies.sort((a, b) => {
            const dateA = a.createdAt ? a.createdAt.toDate() : new Date();
            const dateB = b.createdAt ? b.createdAt.toDate() : new Date();
            return dateA - dateB;
        });

        res.json({ replies });
    } catch (error) {
        console.error('Error fetching replies:', error);
        res.status(500).json({ message: error.message });
    }
};

const deleteReply = async (req, res) => {
    try {
        const { replyId } = req.params;
        const userId = req.user.uid;

        const replyRef = db.collection('community_replies').doc(replyId);
        const replyDoc = await replyRef.get();

        if (!replyDoc.exists) {
            return res.status(404).json({ message: 'Reply not found' });
        }

        const replyData = replyDoc.data();

        // Allow deletion if user is author OR admin
        if (replyData.userId !== userId && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(403).json({ message: 'You can only delete your own replies' });
        }

        await replyRef.delete();

        // Decrement comment count on post
        await db.collection('communityPosts').doc(replyData.postId).update({
            comments: admin.firestore.FieldValue.increment(-1)
        });

        res.json({ message: 'Reply deleted successfully' });
    } catch (error) {
        console.error('Error deleting reply:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getFeed, createPost, deletePost, toggleLike, createReply, getReplies, deleteReply };
