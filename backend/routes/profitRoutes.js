const express = require('express');
const router  = express.Router();
const {
  calculateProfit, getProfitHistory, deleteProfit,
  getTrashedProfits, restoreProfit, permanentDeleteProfit,
} = require('../controllers/profitController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// POST /api/profit/calculate       → calculate & save profit
router.post('/calculate', calculateProfit);

// GET  /api/profit/history         → get active profit history
router.get('/history', getProfitHistory);

// GET  /api/profit/trash           → get trashed records
router.get('/trash', getTrashedProfits);

// POST /api/profit/:id/restore     → restore from trash
router.post('/:id/restore', restoreProfit);

// DELETE /api/profit/:id           → soft delete (move to trash)
router.delete('/:id', deleteProfit);

// DELETE /api/profit/:id/permanent → permanently delete from trash
router.delete('/:id/permanent', permanentDeleteProfit);

module.exports = router;
