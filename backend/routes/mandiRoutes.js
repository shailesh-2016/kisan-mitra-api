const express = require('express');
const router  = express.Router();
const { getMandiPrices, getDistricts } = require('../controllers/mandiController');

// GET /api/mandi              → all prices (optional ?state=Gujarat&district=Ahmedabad&commodity=tomato)
router.get('/', getMandiPrices);

// GET /api/mandi/districts    → list of districts
router.get('/districts', getDistricts);

module.exports = router;
