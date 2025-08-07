import axiosInstance from './axiosInstance';

const paymentService = {
  // Create payment
  createPayment: async (paymentData) => {
    try {
      const response = await axiosInstance.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment details
  getPaymentDetails: async (paymentId) => {
    try {
      const response = await axiosInstance.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment history
  getPaymentHistory: async (page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get('/payments/history', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment invoice
  getPaymentInvoice: async (paymentId) => {
    try {
      const response = await axiosInstance.get(`/payments/${paymentId}/invoice`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Download invoice
  downloadInvoice: async (paymentId) => {
    try {
      const response = await axiosInstance.get(`/payments/${paymentId}/invoice/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy doanh thu của chủ nhà
  getLandlordRevenue: async () => {
    try {
      const response = await axiosInstance.get('/payments/landlord/revenue');
      return response.data;
    } catch (error) {
      console.error("Error fetching landlord revenue:", error);
      return [];
    }
  }
};

export default paymentService; 