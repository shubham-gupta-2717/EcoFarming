const express = require('express');
const router = express.Router();
const { getBehaviorReport, getBehaviorTimeline } = require('../controllers/behaviorController');

router.get('/report', getBehaviorReport);
router.get('/timeline', getBehaviorTimeline);

module.exports = router;
