const express = require('express');
const router = express.Router();
const { getCropCalendar } = require('../controllers/cropController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/calendar', getCropCalendar);

module.exports = router;
