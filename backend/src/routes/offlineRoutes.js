const express = require('express');
const router = express.Router();
const { pullData, pushData } = require('../controllers/offlineController');

router.get('/pull', pullData);
router.post('/push', pushData);

module.exports = router;
