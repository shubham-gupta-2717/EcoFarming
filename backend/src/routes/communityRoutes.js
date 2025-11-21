const express = require('express');
const router = express.Router();
const { getFeed, createPost } = require('../controllers/communityController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/feed', getFeed);
router.post('/post', createPost);

module.exports = router;
