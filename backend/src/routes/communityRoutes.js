const express = require('express');
const router = express.Router();
const { getFeed, createPost, deletePost } = require('../controllers/communityController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/feed', getFeed);
router.post('/post', verifyToken, upload.single('file'), createPost);
router.delete('/post/:postId', verifyToken, deletePost);

module.exports = router;
