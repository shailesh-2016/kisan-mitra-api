const express = require('express');
const router  = express.Router();
const { register, sendOtp, verifyOtp } = require('../controllers/authController');

// POST /api/auth/register   → create user + send OTP
router.post('/register', register);

// POST /api/auth/send-otp   → send OTP to existing user
router.post('/send-otp', sendOtp);

// POST /api/auth/verify-otp → verify OTP + return JWT
router.post('/verify-otp', verifyOtp);

module.exports = router;
