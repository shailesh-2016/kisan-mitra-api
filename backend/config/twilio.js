const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Send OTP SMS via Twilio
 * @param {string} mobile - 10-digit Indian mobile number
 * @param {string} otp    - 6-digit OTP
 */
const sendOtpSms = async (mobile, otp) => {
  // Format to E.164 for India (+91)
  const to = mobile.startsWith('+') ? mobile : `+91${mobile}`;

  const message = await client.messages.create({
    body: `Your Kisan Plus OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });

  console.log(`📱 Twilio SMS sent to ${to} | SID: ${message.sid}`);
  return message.sid;
};

module.exports = { sendOtpSms };
