const webpush = require('web-push');

// Cấu hình VAPID keys (lưu ý: cần lưu vào biến môi trường thực tế)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@yourdomain.com';

// Only configure if valid VAPID keys are provided
let isConfigured = false;
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY && VAPID_PUBLIC_KEY.length > 10) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    isConfigured = true;
    console.log('[PushService] Web push configured successfully');
  } catch (error) {
    console.warn('[PushService] Failed to configure web push:', error.message);
  }
} else {
  console.warn('[PushService] VAPID keys not configured, push notifications disabled');
}

// Gửi push notification tới một subscription
const sendPush = async (subscription, payload) => {
  if (!isConfigured) {
    console.warn('[PushService] Push not configured, skipping notification');
    return false;
  }
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

module.exports = { sendPush, sendBulkPush, VAPID_PUBLIC_KEY, isConfigured }; 