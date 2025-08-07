import axiosInstance from './axiosInstance';

const priceHistoryService = {
  // Lấy lịch sử giá của accommodation
  getPriceHistory: async (accommodationId, params = {}) => {
    const response = await axiosInstance.get(`/price-history/accommodation/${accommodationId}`, { params });
    return response.data;
  },

  // Lấy tất cả lịch sử giá
  getAllPriceHistory: async (params = {}) => {
    const response = await axiosInstance.get('/price-history', { params });
    return response.data;
  },

  // Lấy tất cả lịch sử giá (alias for getAllPriceHistory)
  getPriceHistories: async (params = {}) => {
    const response = await axiosInstance.get('/price-history', { params });
    return response.data;
  },

  // Thêm lịch sử giá
  addPriceHistory: async (priceHistoryData) => {
    const response = await axiosInstance.post('/price-history', priceHistoryData);
    return response.data;
  },

  // Tạo lịch sử giá mới
  createPriceHistory: async (priceHistoryData) => {
    const response = await axiosInstance.post('/price-history', priceHistoryData);
    return response.data;
  },

  // Xóa lịch sử giá
  deletePriceHistory: async (historyId) => {
    const response = await axiosInstance.delete(`/price-history/${historyId}`);
    return response.data;
  },

  // Lấy thống kê giá
  getPriceStats: async (accommodationId, params = {}) => {
    const response = await axiosInstance.get(`/price-history/accommodation/${accommodationId}/stats`, { params });
    return response.data;
  },

  // Export lịch sử giá
  exportPriceHistory: async (accommodationId, format = 'csv') => {
    const response = await axiosInstance.get(`/price-history/accommodation/${accommodationId}/export`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  }
};

export default priceHistoryService; 