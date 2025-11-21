const express = require('express');
const router = express.Router();
const { getAdminStats } = require('../controllers/adminController');
const { verifyToken, authorizeRole } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(authorizeRole('admin'));

router.get('/stats', getAdminStats);

module.exports = router;
