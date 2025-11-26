const express = require('express');
const router = express.Router();
const { generateQuiz, submitQuiz, getQuizHistory } = require('../controllers/quizController');
const { verifyToken } = require('../middleware/authMiddleware');

// All quiz routes require authentication
router.use(verifyToken);

router.post('/generate', generateQuiz);
router.post('/submit', submitQuiz);
router.get('/history', getQuizHistory);

module.exports = router;
