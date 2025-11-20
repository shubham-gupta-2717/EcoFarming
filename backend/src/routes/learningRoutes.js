const express = require('express');
const router = express.Router();
const { getSnippets, getQuiz } = require('../controllers/learningController');

router.get('/snippets', getSnippets);
router.get('/quiz', getQuiz);

module.exports = router;
