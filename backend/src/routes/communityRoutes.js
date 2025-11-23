const express = require('express');
const router = express.Router();
const { getFeed, createPost, deletePost, toggleLike, createReply, getReplies, deleteReply } = require('../controllers/communityController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/feed', getFeed);
router.post('/post', verifyToken, upload.single('file'), createPost);
router.delete('/post/:postId', verifyToken, deletePost);

// New Routes
router.post('/like/:postId', verifyToken, toggleLike);
router.post('/reply/:postId', verifyToken, createReply);
router.get('/replies/:postId', verifyToken, getReplies);
router.delete('/reply/:replyId', verifyToken, deleteReply);

module.exports = router;
