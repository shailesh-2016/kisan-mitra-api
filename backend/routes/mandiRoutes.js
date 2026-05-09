const express = require('express');
const router  = express.Router();
const { getMandiPrices, getDistricts, getStates } = require('../controllers/mandiController');

// GET /api/mandi              → all prices (optional ?state=Gujarat&district=Ahmedabad&commodity=tomato)
router.get('/', getMandiPrices);

// GET /api/mandi/districts    → list of districts for a state (?state=Gujarat)
router.get('/districts', getDistricts);

// GET /api/mandi/states       → list of all states
router.get('/states', getStates);

module.exports = router;
