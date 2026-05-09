const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  farmerName: { type: String, required: true, trim: true },
  address:    { type: String, trim: true, default: '' },
  date:       { type: String },
  startTime:  { type: String, default: '00:00' },
  endTime:    { type: String, default: '00:00' },
  pricePerHour: { type: Number, required: true, min: 0 },
  totalHours:   { type: Number, default: 0 },
  totalAmount:  { type: Number, default: 0 },
  isDeleted:    { type: Boolean, default: false },
  deletedAt:    { type: Date,    default: null  },
}, { timestamps: true });


const machineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  machineName: { type: String, required: true, trim: true },
  machineType: {
    type: String,
    enum: ['tractor','rotavator','harvester','pump','thresher','other'],
    default: 'tractor',
  },
  emoji: { type: String, default: '🚜' },
  entries: [entrySchema],
  isDeleted:  { type: Boolean, default: false },
  deletedAt:  { type: Date,    default: null  },
}, { timestamps: true });

module.exports = mongoose.model('Machine', machineSchema);
