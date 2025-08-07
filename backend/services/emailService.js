const nodemailer = require('nodemailer');

const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Gửi email đơn lẻ
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html
    });
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Gửi email hàng loạt (marketing/campaign)
const sendBulkEmail = async ({ recipients, subject, text, html }) => {
  let sent = 0, failed = 0;
  for (const to of recipients) {
    const ok = await sendEmail({ to, subject, text, html });
    if (ok) sent++; else failed++;
  }
  return { sent, failed };
};

module.exports = { sendEmail, sendBulkEmail }; 