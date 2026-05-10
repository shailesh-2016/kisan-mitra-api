const express = require('express');
const router  = express.Router();

// ── Privacy Policy ────────────────────────────────────────────────────────────
router.get('/privacy-policy', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Privacy Policy - Kisan Mitra</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; line-height: 1.7; }
    h1 { color: #2E7D32; }
    h2 { color: #388E3C; margin-top: 28px; }
    a { color: #2E7D32; }
  </style>
</head>
<body>
  <h1>Privacy Policy - Kisan Mitra</h1>
  <p><strong>Last updated:</strong> May 2026</p>
  <p>Kisan Mitra is committed to protecting your privacy. This policy explains how we collect, use, and protect your information.</p>
  <h2>1. Information We Collect</h2>
  <ul>
    <li><strong>Mobile number:</strong> Used for OTP-based login.</li>
    <li><strong>Name and village:</strong> Provided during registration.</li>
    <li><strong>Location:</strong> Used to show nearby mandi prices and weather. Not stored on servers.</li>
  </ul>
  <h2>2. How We Use Your Information</h2>
  <ul>
    <li>To provide Kisan Mitra app services.</li>
    <li>To send OTP verification via SMS.</li>
    <li>To show mandi prices, weather, and government schemes.</li>
  </ul>
  <h2>3. Data Storage</h2>
  <p>Your data is stored securely on MongoDB Atlas. We do not sell or share your personal data with third parties.</p>
  <h2>4. Third-Party Services</h2>
  <ul>
    <li>Twilio - OTP SMS delivery</li>
    <li>Data.gov.in - Mandi price data</li>
    <li>OpenWeatherMap - Weather information</li>
    <li>Nominatim - Location geocoding</li>
  </ul>
  <h2>5. Account Deletion</h2>
  <p>You can delete your account anytime from app Settings. All data is permanently removed within 30 days.</p>
  <h2>6. Contact</h2>
  <p>Email: <a href="mailto:support@kisanmitra.app">support@kisanmitra.app</a></p>
  <p style="margin-top:40px;color:#888;font-size:13px;">2026 Kisan Mitra. All rights reserved.</p>
</body>
</html>`;
  res.send(html);
});

// ── Account Deletion ──────────────────────────────────────────────────────────
router.get('/delete-account', (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Delete Account - Kisan Mitra</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #333; line-height: 1.7; }
    h1 { color: #C62828; }
    h2 { color: #D32F2F; margin-top: 28px; }
    .warning { background: #FFF3E0; border-left: 4px solid #FF9800; padding: 12px 16px; border-radius: 4px; margin: 20px 0; }
    .steps { background: #F1F8E9; border-left: 4px solid #4CAF50; padding: 12px 16px; border-radius: 4px; margin: 20px 0; }
    ol li { margin-bottom: 8px; }
  </style>
</head>
<body>
  <h1>Delete Your Kisan Mitra Account</h1>
  <p>You can permanently delete your account and all associated data at any time.</p>
  <div class="warning">
    <strong>Warning:</strong> Account deletion is permanent and cannot be undone.
  </div>
  <h2>How to Delete Your Account</h2>
  <div class="steps">
    <ol>
      <li>Open the Kisan Mitra app.</li>
      <li>Go to Profile tab.</li>
      <li>Tap Settings.</li>
      <li>Scroll down and tap "Delete Account".</li>
      <li>Enter the OTP sent to your mobile number.</li>
      <li>Confirm deletion.</li>
    </ol>
  </div>
  <h2>What Gets Deleted</h2>
  <ul>
    <li>Profile (name, mobile, village)</li>
    <li>All profit records</li>
    <li>All machine and entry records</li>
    <li>All reminders</li>
    <li>All social posts and follows</li>
  </ul>
  <h2>Data Retention</h2>
  <p>All data is permanently removed from our servers within 30 days of deletion request.</p>
  <h2>Contact</h2>
  <p>Email: support@kisanmitra.app</p>
  <p style="margin-top:40px;color:#888;font-size:13px;">2026 Kisan Mitra. All rights reserved.</p>
</body>
</html>`;
  res.send(html);
});

module.exports = router;
