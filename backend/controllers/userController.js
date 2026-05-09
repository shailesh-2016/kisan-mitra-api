const User    = require('../models/User');
const Machine = require('../models/Machine');
const Profit  = require('../models/Profit');

// ── GET /api/user/profile ─────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-otp')
      .populate('followers', '_id')
      .populate('following', '_id');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/user/profile ─────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, village, district, state, bio, profileImage, coverImage, farmSize, cropsGrown, experience, language } = req.body;

    if (name !== undefined && !name?.trim()) {
      return res.status(400).json({ success: false, message: 'Name cannot be empty' });
    }

    const updates = {};
    if (name         !== undefined) updates.name         = name.trim();
    if (village      !== undefined) updates.village      = village.trim();
    if (district     !== undefined) updates.district     = district.trim();
    if (state        !== undefined) updates.state        = state.trim();
    if (bio          !== undefined) updates.bio          = bio.trim();
    if (profileImage !== undefined) updates.profileImage = profileImage;
    if (coverImage   !== undefined) updates.coverImage   = coverImage;
    if (farmSize     !== undefined) updates.farmSize     = farmSize.trim();
    if (cropsGrown   !== undefined) updates.cropsGrown   = cropsGrown.trim();
    if (experience   !== undefined) updates.experience   = experience.trim();
    if (language     !== undefined) updates.language     = language;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true },
    ).select('-otp');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/user/delete ───────────────────────────────────────────────────
// Permanently removes the user and ALL their associated data.
// Requires a valid deletion OTP that was sent via /api/user/request-delete-otp.
const deleteAccount = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP is required to delete account' });
    }

    // Re-fetch user with OTP field
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Verify OTP
    if (!user.otp?.code || user.otp.code !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Please try again.' });
    }

    // Check OTP expiry
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const userId = user._id;

    // 1. Delete all machines owned by this user
    await Machine.deleteMany({ user: userId });

    // 2. Delete all profit records owned by this user
    await Profit.deleteMany({ user: userId });

    // 3. Delete the user document itself
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'Account and all associated data deleted successfully',
    });
  } catch (err) {
    console.error('Delete account error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProfile, updateProfile, deleteAccount };
