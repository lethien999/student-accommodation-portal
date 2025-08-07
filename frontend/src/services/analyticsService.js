import axiosInstance from './axiosInstance';

const analyticsService = {
  getDashboardStats: async () => {
    const res = await axiosInstance.get('/analytics/dashboard');
    return res.data;
  },
  getUserActivityTrends: async (params = {}) => {
    const res = await axiosInstance.get('/analytics/user-activity', { params });
    return res.data;
  },
  getRevenueTrends: async (params = {}) => {
    const res = await axiosInstance.get('/analytics/revenue', { params });
    return res.data;
  },
  getTopLandlords: async (params = {}) => {
    const res = await axiosInstance.get('/analytics/top-landlords', { params });
    return res.data;
  },
  getAccommodationInsights: async (params = {}) => {
    const res = await axiosInstance.get('/analytics/accommodation-insights', { params });
    return res.data;
  }
};

export default analyticsService; 