const express = require('express');
const router  = express.Router();
const { 
  register, 
  login, 
  verifyOtp, 
  forgotPassword, 
  resetPassword, 
  googleLogin, 
  facebookLogin 
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/google-login', googleLogin);
router.post('/facebook-login', facebookLogin);

module.exports = router;
