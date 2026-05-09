const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'],
  },
  village: {
    type: String,
    trim: true,
    default: '',
  },
  district: {
    type: String,
    trim: true,
    default: '',
  },
  state: {
    type: String,
    trim: true,
    default: '',
  },
  bio: {
    type: String,
    trim: true,
    default: '',
    maxlength: [200, 'Bio cannot exceed 200 characters'],
  },
  profileImage: { type: String, default: '' },
  coverImage:   { type: String, default: '' },
  followers:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  farmSize:     { type: String, trim: true, default: '' },
  cropsGrown:   { type: String, trim: true, default: '' },
  experience:   { type: String, trim: true, default: '' },
  language: {
    type: String,
    enum: ['gu', 'hi', 'en'],
    default: 'gu',
  },
  otp: {
    code: { type: String },
    expiresAt: { type: Date },
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
