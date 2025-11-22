const express = require('express');
const router = express.Router();
const { getFeed, createPost, deletePost } = require('../controllers/communityController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/feed', getFeed);
router.post('/post', createPost);
router.delete('/post/:postId', deletePost);

module.exports = router;
