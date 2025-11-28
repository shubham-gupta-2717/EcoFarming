const express = require('express');
const router = express.Router();
const {
    getCategories,
    getModulesByCategory,
    getAllModules,
    getModule,
    deleteModule,
    updateModule,
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
router.get('/modules', getAllModules); // New: Get all modules
router.get('/modules/:category', getModulesByCategory);
router.get('/module/:id', getModule);
router.delete('/module/:id', deleteModule); // New: Delete module
router.put('/module/:id', updateModule); // New: Update module

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
