const express = require('express');
const router = express.Router();
const { getRecommendedSchemes } = require('../controllers/schemesController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/recommend', getRecommendedSchemes);

module.exports = router;
