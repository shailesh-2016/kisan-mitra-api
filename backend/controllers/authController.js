const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpSms } = require('../config/twilio');

// ── Helpers ───────────────────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP — uses Twilio in production, logs to console in development
const dispatchOtp = async (mobile, otp) => {
  if (process.env.NODE_ENV === 'production') {
    await sendOtpSms(mobile, otp);
  } else {
    // Dev mode: print OTP to console instead of sending SMS
    console.log(`\n📱 [DEV] OTP for +91${mobile}: ${otp}\n`);
  }
};

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, mobile, village, language } = req.body;

    if (!name?.trim() || !mobile) {
      return res.status(400).json({ success: false, message: 'Name and mobile are required' });
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number' });
    }

    const exists = await User.findOne({ mobile });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Mobile already registered. Please login.' });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      name: name.trim(),
      mobile,
      village: village?.trim() || '',
      language: language || 'gu',
      otp: { code: otp, expiresAt: otpExpiry },
    });

    await dispatchOtp(mobile, otp);

    res.status(201).json({
      success: true,
      message: 'OTP sent to your mobile number',
      mobile,
      // Expose OTP only in development for testing
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/send-otp ───────────────────────────────────────────────────
const sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({ success: false, message: 'Mobile number required' });
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit mobile number' });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Mobile not registered. Please register first.',
      });
    }

    // Rate limit: prevent OTP spam (1 OTP per 60 seconds)
    if (user.otp?.expiresAt && user.otp.expiresAt > new Date(Date.now() - 9 * 60 * 1000)) {
      const waitSec = Math.ceil((user.otp.expiresAt - (Date.now() - 9 * 60 * 1000)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSec} seconds before requesting a new OTP`,
      });
    }

    const otp = generateOtp();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();

    await dispatchOtp(mobile, otp);

    res.json({
      success: true,
      message: 'OTP sent to your mobile number',
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    });
  } catch (err) {
    console.error('Send OTP error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ success: false, message: 'Mobile and OTP are required' });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check OTP match
    if (!user.otp?.code || user.otp.code !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    // Check OTP expiry
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id:           user._id,
        name:         user.name,
        mobile:       user.mobile,
        village:      user.village,
        district:     user.district || '',
        state:        user.state    || '',
        bio:          user.bio      || '',
        profileImage: user.profileImage || '',
        language:     user.language,
      },
    });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/user/request-delete-otp ────────────────────────────────────────
// Sends a deletion-specific OTP to the user's registered mobile number.
const requestDeleteOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Rate limit: 1 OTP per 60 seconds
    if (user.otp?.expiresAt && user.otp.expiresAt > new Date(Date.now() - 9 * 60 * 1000)) {
      const waitSec = Math.ceil((user.otp.expiresAt - (Date.now() - 9 * 60 * 1000)) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSec} seconds before requesting a new OTP`,
      });
    }

    const otp = generateOtp();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();

    await dispatchOtp(user.mobile, otp);

    res.json({
      success: true,
      message: 'Deletion OTP sent to your registered mobile number',
      mobile: user.mobile,
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    });
  } catch (err) {
    console.error('Request delete OTP error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, sendOtp, verifyOtp, requestDeleteOtp };
