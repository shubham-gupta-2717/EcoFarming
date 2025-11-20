const express = require('express');
const router = express.Router();
const { getCropCalendar } = require('../controllers/cropController');

router.get('/calendar', getCropCalendar);

module.exports = router;
