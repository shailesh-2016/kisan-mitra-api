const mongoose = require('mongoose');

const profitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cropName:     { type: String, trim: true, default: 'Unknown' },
  seedCost:     { type: Number, default: 0 },
  fertCost:     { type: Number, default: 0 },
  labourCost:   { type: Number, default: 0 },
  irrigCost:    { type: Number, default: 0 },
  otherCost:    { type: Number, default: 0 },
  totalCost:    { type: Number, required: true },
  production:   { type: Number, required: true }, // kg
  pricePerKg:   { type: Number, required: true },
  totalIncome:  { type: Number, required: true },
  netProfit:    { type: Number, required: true },
  acreArea:     { type: Number, default: null },
  perAcreProfit:{ type: Number, default: null },
  date:         { type: String },
  isDeleted:    { type: Boolean, default: false },
  deletedAt:    { type: Date,    default: null  },
}, { timestamps: true });

module.exports = mongoose.model('Profit', profitSchema);
