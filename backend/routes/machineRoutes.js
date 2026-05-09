const express = require('express');
const router  = express.Router();
const {
  getMachines, getMachineById, addMachine, addEntry,
  deleteMachine, deleteEntry,
  getTrashedMachines, restoreMachine, permanentDeleteMachine,
} = require('../controllers/machineController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// GET  /api/machine              → list active machines
router.get('/', getMachines);

// GET  /api/machine/trash        → list trashed machines
router.get('/trash', getTrashedMachines);

// GET  /api/machine/:id          → single machine with entries
router.get('/:id', getMachineById);

// POST /api/machine/add          → add new machine
router.post('/add', addMachine);

// POST /api/machine/add-entry    → add entry to machine
router.post('/add-entry', addEntry);

// POST /api/machine/:id/restore  → restore from trash
router.post('/:id/restore', restoreMachine);

// DELETE /api/machine/:machineId/entry/:entryId → soft delete entry
router.delete('/:machineId/entry/:entryId', deleteEntry);

// DELETE /api/machine/:id        → soft delete (move to trash)
router.delete('/:id', deleteMachine);

// DELETE /api/machine/:id/permanent → permanently delete from trash
router.delete('/:id/permanent', permanentDeleteMachine);

module.exports = router;
