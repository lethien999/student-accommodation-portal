const webpush = require('web-push');

// Cấu hình VAPID keys (lưu ý: cần lưu vào biến môi trường thực tế)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'YOUR_VAPID_PRIVATE_KEY';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@yourdomain.com';

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// Gửi push notification tới một subscription
const sendPush = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error('Push notification failed:', error);
    return false;
  }
};

// Gửi push notification hàng loạt
const sendBulkPush = async (subscriptions, payload) => {
  let sent = 0, failed = 0;
  for (const sub of subscriptions) {
    const ok = await sendPush(sub, payload);
    if (ok) sent++; else failed++;
  }
  return { sent, failed };
};

module.exports = { sendPush, sendBulkPush, VAPID_PUBLIC_KEY }; 