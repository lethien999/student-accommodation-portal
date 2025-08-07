const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Initialize Twilio client
let twilioClient = null;
const isMockTwilio = !process.env.TWILIO_ACCOUNT_SID || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
if (!isMockTwilio) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Initialize email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

class TwoFactorService {
  // Generate secret for authenticator app
  static generateSecret() {
    return speakeasy.generateSecret({
      length: 20,
      name: process.env.APP_NAME
    });
  }

  // Generate QR code for authenticator app
  static async generateQRCode(secret) {
    return await QRCode.toDataURL(secret.otpauth_url);
  }

  // Verify TOTP code
  static verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow 30 seconds clock skew
    });
  }

  // Send SMS code (dùng cho OTP)
  static async sendSMSCode(phoneNumber, code) {
    return await TwoFactorService.sendSMS(phoneNumber, `Your verification code is: ${code}`);
  }

  // Hàm gửi SMS tiện ích chung
  static async sendSMS(phoneNumber, message) {
    if (isMockTwilio) {
      console.log(`[MOCK SMS] To: ${phoneNumber} | Message: ${message}`);
      return true;
    }
    try {
      await twilioClient.messages.create({
        body: message,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER
      });
      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  // Send email code
  static async sendEmailCode(email, code) {
    try {
      await emailTransporter.sendMail({
        from: process.env.SMTP_FROM,
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${code}`,
        html: `<p>Your verification code is: <strong>${code}</strong></p>`
      });
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  // Generate random code for SMS/Email
  static generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

module.exports = TwoFactorService; 