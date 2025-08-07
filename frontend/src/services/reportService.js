import axiosInstance from './axiosInstance';

const reportService = {
  createReport: async (data) => {
    try {
      const response = await axiosInstance.post('/reports', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getReports: async (params) => {
    try {
      const response = await axiosInstance.get('/reports', { params });
      return response.data || { reports: [] };
    } catch (error) {
      console.error('Error in getReports:', error);
      return { reports: [] };
    }
  },

  updateReportStatus: async (id, status) => {
    try {
      const response = await axiosInstance.patch(`/reports/${id}`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteReport: async (id) => {
    try {
      const response = await axiosInstance.delete(`/reports/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Moderator specific methods
  getModeratorStats: async () => {
    try {
      const response = await axiosInstance.get('/reports/moderator/stats');
      return response.data || { pendingReports: { count: 0 }, pendingReviews: { count: 0 }, processedItems: { count: 0 } };
    } catch (error) {
      console.error('Error in getModeratorStats:', error);
      return { pendingReports: { count: 0 }, pendingReviews: { count: 0 }, processedItems: { count: 0 } };
    }
  },

  getPendingReports: async () => {
    try {
      const response = await axiosInstance.get('/reports/pending');
      return response.data || [];
    } catch (error) {
      console.error('Error in getPendingReports:', error);
      return [];
    }
  },

  getProcessedItems: async () => {
    try {
      const response = await axiosInstance.get('/reports/processed');
      return response.data || [];
    } catch (error) {
      console.error('Error in getProcessedItems:', error);
      return [];
    }
  },
};

export default reportService; 