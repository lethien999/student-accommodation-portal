import axiosInstance from './axiosInstance';

const pushNotificationService = {
  // Yêu cầu quyền thông báo
  requestPermission: async () => {
    if ('Notification' in window && navigator.serviceWorker) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  },

  // Lấy device token từ service worker
  getDeviceToken: async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return subscription ? subscription.toJSON() : null;
      } catch (error) {
        console.error('Error getting device token:', error);
        return null;
      }
    }
    return null;
  },

  // Tạo subscription mới
  createSubscription: async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // VAPID public key (cần thay thế bằng key thực tế)
        const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY';
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
        
        return subscription.toJSON();
      } catch (error) {
        console.error('Error creating subscription:', error);
        throw error;
      }
    }
    throw new Error('Push notifications not supported');
  },

  // Đăng ký nhận push notification
  subscribe: async (token) => {
    try {
      const response = await axiosInstance.post('/notifications/push/subscribe', { 
        token,
        platform: 'web',
        userAgent: navigator.userAgent
      });
      return response.data;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  },

  // Hủy đăng ký push notification
  unsubscribe: async (token) => {
    try {
      const response = await axiosInstance.post('/notifications/push/unsubscribe', { token });
      return response.data;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      throw error;
    }
  },

  // Gửi thử thông báo
  sendTestNotification: async (userId) => {
    try {
      const response = await axiosInstance.post('/notifications/push/test', { userId });
      return response.data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  },

  // Cập nhật cài đặt thông báo
  updateSettings: async (settings) => {
    try {
      const response = await axiosInstance.put('/notifications/settings', settings);
      return response.data;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  },

  // Lấy cài đặt thông báo
  getSettings: async () => {
    try {
      const response = await axiosInstance.get('/notifications/settings');
      return response.data;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      throw error;
    }
  }
};

// Helper function để chuyển đổi VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default pushNotificationService; 