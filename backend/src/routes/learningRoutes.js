const express = require('express');
const router = express.Router();
const { getSnippets, getQuiz } = require('../controllers/learningController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/snippets', getSnippets);
router.get('/quiz', getQuiz);

module.exports = router;
