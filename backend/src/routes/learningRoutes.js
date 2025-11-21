const express = require('express');
const router = express.Router();
const {
    getCategories,
    getModulesByCategory,
    getModule,
    submitQuiz,
    getRecommendations,
    generateModule,
    getSnippets,
    getQuiz
} = require('../controllers/learningController');
const { verifyToken } = require('../middleware/authMiddleware');

// All learning routes require authentication
router.use(verifyToken);

// Categories
router.get('/categories', getCategories);

// Modules
router.get('/modules/:category', getModulesByCategory);
router.get('/module/:id', getModule);

// Quiz
router.post('/quiz/submit', submitQuiz);

// Recommendations
router.get('/recommendations', getRecommendations);

// Generate module (for seeding content)
router.post('/generate-module', generateModule);

// Legacy routes (backward compatibility)
router.get('/snippets', getSnippets);
router.get('/quiz', getQuiz);

module.exports = router;
