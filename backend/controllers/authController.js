const jwt  = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendEmailOtp } = require('../config/email');

// ── Helpers ───────────────────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── POST /api/auth/register ───────────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, village, language } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    
    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
      }
      
      // User exists but not verified. Update their details and resend OTP
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.name = name.trim();
      user.village = village?.trim() || '';
      user.language = language || 'gu';
      
      const otp = generateOtp();
      user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
      await user.save();
      
      await sendEmailOtp(user.email, otp);
      
      return res.status(201).json({
        success: true,
        message: 'Registration successful. OTP sent to your email for verification.',
        email: user.email,
        ...(process.env.NODE_ENV !== 'production' && { otp }),
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      village: village?.trim() || '',
      language: language || 'gu',
      isVerified: false,
      provider: 'local',
      otp: { code: otp, expiresAt: otpExpiry },
    });

    await sendEmailOtp(user.email, otp);

    res.status(201).json({
      success: true,
      message: 'Registration successful. OTP sent to your email for verification.',
      email: user.email,
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/login ──────────────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.provider !== 'local') {
      return res.status(400).json({ success: false, message: `Please login using ${user.provider}` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      const otp = generateOtp();
      user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
      await user.save();
      await sendEmailOtp(user.email, otp);
      
      return res.status(403).json({ 
        success: false, 
        message: 'Email not verified. A new OTP has been sent to your email.', 
        requiresVerification: true,
        email: user.email 
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        village:      user.village,
        profileImage: user.profileImage,
        provider:     user.provider,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/verify-otp ─────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
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
    user.isVerified = true;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Verification successful',
      token,
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        village:      user.village,
        profileImage: user.profileImage,
        provider:     user.provider,
      },
    });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/forgot-password ────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal that user doesn't exist for security
      return res.json({ success: true, message: 'If that email is registered, you will receive an OTP shortly.' });
    }

    if (user.provider !== 'local') {
      return res.status(400).json({ success: false, message: `Account registered with ${user.provider}. Password reset not applicable.` });
    }

    const otp = generateOtp();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();

    await sendEmailOtp(user.email, otp);

    res.json({
      success: true,
      message: 'OTP sent to your email',
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/reset-password ─────────────────────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check OTP match
    if (!user.otp?.code || user.otp.code !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // Check OTP expiry
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = undefined;
    
    // Auto verify if not already verified
    if (!user.isVerified) {
        user.isVerified = true;
    }
    
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login.',
    });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/google-login ───────────────────────────────────────────────
const googleLogin = async (req, res) => {
  try {
    const { email, name, profileImage, googleId } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required from Google' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (user.provider === 'local') {
          return res.status(400).json({ success: false, message: 'Email already registered with password. Please login normally.' });
      }
    } else {
      user = await User.create({
        name: name || 'Google User',
        email: email.toLowerCase(),
        profileImage: profileImage || '',
        provider: 'google',
        isVerified: true,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        profileImage: user.profileImage,
        provider:     user.provider,
      },
    });
  } catch (err) {
    console.error('Google login error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/auth/facebook-login ─────────────────────────────────────────────
const facebookLogin = async (req, res) => {
  try {
    const { email, name, profileImage, facebookId } = req.body;
    
    // Facebook might not provide email depending on permissions
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email permission is required for Facebook login' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (user.provider === 'local') {
          return res.status(400).json({ success: false, message: 'Email already registered with password. Please login normally.' });
      }
    } else {
      user = await User.create({
        name: name || 'Facebook User',
        email: email.toLowerCase(),
        profileImage: profileImage || '',
        provider: 'facebook',
        isVerified: true,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Facebook login successful',
      token,
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        profileImage: user.profileImage,
        provider:     user.provider,
      },
    });
  } catch (err) {
    console.error('Facebook login error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/user/request-delete-otp ────────────────────────────────────────
const requestDeleteOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Rate limit: 1 OTP per 30 seconds
    const thirtySecsAgo = new Date(Date.now() - 30 * 1000);
    const otpCreationTime = user.otp?.expiresAt 
      ? new Date(user.otp.expiresAt.getTime() - 10 * 60 * 1000) 
      : null;

    if (otpCreationTime && otpCreationTime > thirtySecsAgo) {
      const waitSec = Math.ceil((30 * 1000 - (Date.now() - otpCreationTime.getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSec > 0 ? waitSec : 30} seconds before requesting a new OTP`,
      });
    }

    const otp = generateOtp();
    user.otp = { code: otp, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save();

    await sendEmailOtp(user.email, otp);

    res.json({
      success: true,
      message: 'Deletion OTP sent to your registered email',
      email: user.email,
      ...(process.env.NODE_ENV !== 'production' && { otp }),
    });
  } catch (err) {
    console.error('Request delete OTP error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { 
  register, 
  login, 
  verifyOtp, 
  forgotPassword, 
  resetPassword, 
  googleLogin, 
  facebookLogin,
  requestDeleteOtp
};
