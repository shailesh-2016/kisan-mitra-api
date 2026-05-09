const Profit = require('../models/Profit');

// ── POST /api/profit/calculate ────────────────────────────────────────────────
const calculateProfit = async (req, res) => {
  try {
    const {
      cropName, seedCost, fertCost, labourCost, irrigCost, otherCost,
      production, pricePerKg, acreArea,
    } = req.body;

    if (!production || !pricePerKg) {
      return res.status(400).json({ success: false, message: 'Production and price per kg are required' });
    }

    const totalCost = [seedCost, fertCost, labourCost, irrigCost, otherCost]
      .reduce((sum, v) => sum + (Number(v) || 0), 0);

    const totalIncome   = Number(production) * Number(pricePerKg);
    const netProfit     = totalIncome - totalCost;
    const perAcreProfit = acreArea && Number(acreArea) > 0 ? netProfit / Number(acreArea) : null;

    const record = await Profit.create({
      userId: req.user._id,
      cropName: cropName || 'Unknown',
      seedCost:   Number(seedCost)   || 0,
      fertCost:   Number(fertCost)   || 0,
      labourCost: Number(labourCost) || 0,
      irrigCost:  Number(irrigCost)  || 0,
      otherCost:  Number(otherCost)  || 0,
      totalCost,
      production: Number(production),
      pricePerKg: Number(pricePerKg),
      totalIncome,
      netProfit,
      acreArea:     acreArea ? Number(acreArea) : null,
      perAcreProfit,
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    });

    res.status(201).json({
      success: true,
      result: {
        totalCost,
        totalIncome,
        netProfit,
        perAcreProfit,
      },
      record,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/profit/history ───────────────────────────────────────────────────
const getProfitHistory = async (req, res) => {
  try {
    const history = await Profit.find({ userId: req.user._id, isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/profit/:id  (soft delete) ─────────────────────────────────────
const deleteProfit = async (req, res) => {
  try {
    const record = await Profit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Record moved to trash' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/profit/trash ─────────────────────────────────────────────────────
const getTrashedProfits = async (req, res) => {
  try {
    const history = await Profit.find({ userId: req.user._id, isDeleted: true }).sort({ deletedAt: -1 });
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/profit/:id/restore ──────────────────────────────────────────────
const restoreProfit = async (req, res) => {
  try {
    const record = await Profit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found in trash' });
    res.json({ success: true, message: 'Record restored', record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/profit/:id/permanent ─────────────────────────────────────────
const permanentDeleteProfit = async (req, res) => {
  try {
    const record = await Profit.findOneAndDelete({ _id: req.params.id, userId: req.user._id, isDeleted: true });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found in trash' });
    res.json({ success: true, message: 'Record permanently deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { calculateProfit, getProfitHistory, deleteProfit, getTrashedProfits, restoreProfit, permanentDeleteProfit };
