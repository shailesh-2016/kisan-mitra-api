const Machine = require('../models/Machine');

// Helper: calculate hours from HH:MM strings
const calcHours = (start, end) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return diff > 0 ? Math.round((diff / 60) * 10) / 10 : 0;
};

// ── GET /api/machine ──────────────────────────────────────────────────────────
const getMachines = async (req, res) => {
  try {
    const machines = await Machine.find({ userId: req.user._id, isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    res.json({ success: true, machines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/machine/:id ──────────────────────────────────────────────────────
const getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findOne({ _id: req.params.id, userId: req.user._id, isDeleted: { $ne: true } });
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });
    // Filter out soft-deleted entries
    const filtered = { ...machine.toObject(), entries: machine.entries.filter(e => !e.isDeleted) };
    res.json({ success: true, machine: filtered });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/machine/add ─────────────────────────────────────────────────────
const addMachine = async (req, res) => {
  try {
    const { machineName, machineType, emoji } = req.body;
    if (!machineName) return res.status(400).json({ success: false, message: 'Machine name required' });

    const machine = await Machine.create({
      userId: req.user._id,
      machineName,
      machineType: machineType || 'tractor',
      emoji: emoji || '🚜',
      entries: [],
    });
    res.status(201).json({ success: true, machine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/machine/add-entry ───────────────────────────────────────────────
const addEntry = async (req, res) => {
  try {
    const { machineId, farmerName, address, pricePerHour, totalHours, totalAmount } = req.body;

    if (!machineId || !farmerName || !pricePerHour || totalHours === undefined) {
      return res.status(400).json({ success: false, message: 'machineId, farmerName, pricePerHour, totalHours are required' });
    }

    const machine = await Machine.findOne({ _id: machineId, userId: req.user._id });
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });

    const hours  = parseFloat(totalHours) || 0;
    const amount = totalAmount !== undefined ? Number(totalAmount) : Math.round(hours * Number(pricePerHour));

    const entry = {
      farmerName,
      address: address || '',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      startTime: '00:00',
      endTime: '00:00',
      pricePerHour: Number(pricePerHour),
      totalHours: hours,
      totalAmount: amount,
    };

    machine.entries.unshift(entry);
    await machine.save();

    res.status(201).json({ success: true, entry: machine.entries[0], machine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/machine/:id  (soft delete) ────────────────────────────────────
const deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isDeleted: { $ne: true } },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });
    res.json({ success: true, message: 'Machine moved to trash' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/machine/:machineId/entry/:entryId  (soft delete entry) ────────
const deleteEntry = async (req, res) => {
  try {
    const machine = await Machine.findOne({ _id: req.params.machineId, userId: req.user._id });
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found' });

    const entry = machine.entries.id(req.params.entryId);
    if (!entry) return res.status(404).json({ success: false, message: 'Entry not found' });

    // Soft-delete the entry by marking it
    entry.isDeleted = true;
    entry.deletedAt = new Date();
    await machine.save();

    res.json({ success: true, message: 'Entry moved to trash' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/machine/trash ────────────────────────────────────────────────────
const getTrashedMachines = async (req, res) => {
  try {
    const machines = await Machine.find({ userId: req.user._id, isDeleted: true }).sort({ deletedAt: -1 });
    res.json({ success: true, machines });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/machine/:id/restore ─────────────────────────────────────────────
const restoreMachine = async (req, res) => {
  try {
    const machine = await Machine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isDeleted: true },
      { isDeleted: false, deletedAt: null },
      { new: true }
    );
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found in trash' });
    res.json({ success: true, message: 'Machine restored', machine });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/machine/:id/permanent ─────────────────────────────────────────
const permanentDeleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findOneAndDelete({ _id: req.params.id, userId: req.user._id, isDeleted: true });
    if (!machine) return res.status(404).json({ success: false, message: 'Machine not found in trash' });
    res.json({ success: true, message: 'Machine permanently deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMachines, getMachineById, addMachine, addEntry, deleteMachine, deleteEntry, getTrashedMachines, restoreMachine, permanentDeleteMachine };
