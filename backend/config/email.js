const nodemailer = require('nodemailer');

let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });
}

const sendEmailOtp = async (email, otp) => {
  console.log(`\n📧 [OTP] For ${email}: ${otp}\n`);

  if (!transporter) {
    return;
  }

  const mailOptions = {
    from: `"Kisan Plus" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🌾 Kisan Plus - Your Verification Code',
    text: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px;">
        <h2 style="color: #2E7D32; margin-top: 0;">🌾 Kisan Plus Verification</h2>
        <p style="color: #555; font-size: 15px;">તમારો કિસાન પ્લસ એકાઉન્ટ વેરિફિકેશન કોડ નીચે મુજબ છે:</p>
        <div style="background-color: #E8F5E9; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #1B5E20; letter-spacing: 6px; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p style="color: #888; font-size: 13px;">આ કોડ 10 મિનિટ માટે માન્ય છે. કૃપા કરીને આ કોડ કોઈની સાથે શેર ન કરશો.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Successfully sent OTP email to ${email}`);
  } catch (error) {
    console.error('❌ [EMAIL] Error sending email:', error.message);
  }
};

module.exports = { sendEmailOtp };
