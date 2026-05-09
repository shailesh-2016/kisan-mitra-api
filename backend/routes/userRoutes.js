const express = require('express');
const router  = express.Router();
const { getProfile, updateProfile, deleteAccount } = require('../controllers/userController');
const { requestDeleteOtp } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// GET    /api/user/profile           — fetch current user profile
router.get('/profile', protect, getProfile);

// PUT    /api/user/profile           — update profile fields
router.put('/profile', protect, updateProfile);

// POST   /api/user/request-delete-otp — send OTP to mobile for account deletion
router.post('/request-delete-otp', protect, requestDeleteOtp);

// DELETE /api/user/delete            — permanently delete account + all data (requires OTP in body)
router.delete('/delete', protect, deleteAccount);

module.exports = router;
