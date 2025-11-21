const express = require('express');
const router = express.Router();
const { pullData, pushData } = require('../controllers/offlineController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/pull', pullData);
router.post('/push', pushData);

module.exports = router;
