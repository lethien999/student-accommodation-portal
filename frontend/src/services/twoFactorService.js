import axiosInstance from './axiosInstance';

const twoFactorService = {
  // Bật 2FA, trả về QR code hoặc secret
  enable2FA: async () => {
    const response = await axiosInstance.post('/2fa/enable');
    return response.data;
  },
  // Xác thực mã OTP khi bật hoặc đăng nhập
  verify2FA: async (otp) => {
    const response = await axiosInstance.post('/2fa/verify', { otp });
    return response.data;
  },
  // Tắt 2FA
  disable2FA: async () => {
    const response = await axiosInstance.post('/2fa/disable');
    return response.data;
  },
  // Lấy trạng thái 2FA
  get2FAStatus: async () => {
    const response = await axiosInstance.get('/2fa/status');
    return response.data;
  }
};

export default twoFactorService; 