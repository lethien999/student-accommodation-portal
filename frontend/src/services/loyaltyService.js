import axiosInstance from './axiosInstance';

const loyaltyService = {
  getLoyaltyPoints: async () => {
    try {
      const response = await axiosInstance.get('/loyalty/points');
      return response.data || { points: 0 };
    } catch (error) {
      console.error('Error in getLoyaltyPoints:', error);
      return { points: 0 };
    }
  },
  addLoyaltyPoint: async (data) => {
    try {
      const response = await axiosInstance.post('/loyalty/add', data);
      return response.data || {};
    } catch (error) {
      console.error('Error in addLoyaltyPoint:', error);
      throw error.response?.data || error.message || 'Lỗi khi cộng điểm';
    }
  },
  redeemLoyaltyPoint: async (data) => {
    try {
      const response = await axiosInstance.post('/loyalty/redeem', data);
      return response.data || {};
    } catch (error) {
      console.error('Error in redeemLoyaltyPoint:', error);
      throw error.response?.data || error.message || 'Lỗi khi đổi điểm';
    }
  },
  /**
   * Fetches the loyalty point history for the current user.
   * @returns {Promise<Array>}
   */
  getHistory: async () => {
    try {
      const response = await axiosInstance.get('/loyalty/history');
      return response.data || [];
    } catch (error) {
      console.error('Error in getHistory:', error);
      return [];
    }
  },
  /**
   * Fetches the loyalty point balance for the current user.
   * @returns {Promise<{balance: number}>}
   */
  getBalance: async () => {
    try {
      const response = await axiosInstance.get('/loyalty/balance');
      return response.data || { balance: 0 };
    } catch (error) {
      console.error('Error in getBalance:', error);
      return { balance: 0 };
    }
  }
};

export default loyaltyService; 