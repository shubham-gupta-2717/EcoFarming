const express = require('express');
const router = express.Router();
const { getBehaviorReport, getBehaviorTimeline } = require('../controllers/behaviorController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/report', getBehaviorReport);
router.get('/timeline', getBehaviorTimeline);

module.exports = router;
