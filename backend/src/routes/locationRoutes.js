const express = require('express');
const router = express.Router();
const { getStates, getDistricts, getSubDistricts } = require('../controllers/locationController');

router.get('/states', getStates);
router.get('/districts/:state', getDistricts);
router.get('/sub-districts/:state/:district', getSubDistricts);

module.exports = router;
