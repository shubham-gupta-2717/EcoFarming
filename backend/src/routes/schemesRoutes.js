const express = require('express');
const router = express.Router();
const { getRecommendedSchemes, addScheme, deleteScheme, updateScheme, getAllSchemes, seedSchemes } = require('../controllers/schemesController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/recommend', getRecommendedSchemes);
router.get('/all', getAllSchemes);
router.post('/add', addScheme);
router.post('/seed', seedSchemes);
router.put('/:id', updateScheme);
router.delete('/:id', deleteScheme);

module.exports = router;
