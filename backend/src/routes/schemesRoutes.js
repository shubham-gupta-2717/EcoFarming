const express = require('express');
const router = express.Router();
const { getRecommendedSchemes } = require('../controllers/schemesController');

router.get('/recommend', getRecommendedSchemes);

module.exports = router;
