import axiosInstance from './axiosInstance';

const moderatorService = {
  // Lấy dữ liệu tổng quan cho dashboard của moderator
  getDashboardStats: async () => {
    try {
      const response = await axiosInstance.get('/moderator/stats');
      return response.data;
    } catch (error) {
      console.error("Error fetching moderator stats:", error);
      return {
        stats: {
          pendingReports: 0,
          pendingReviews: 0,
          processedToday: 0,
        },
      };
    }
  },

  // Lấy danh sách báo cáo (có filter theo status)
  getReports: async (params) => {
    try {
      const response = await axiosInstance.get('/reports', { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching reports:", error);
      return { reports: [], total: 0 };
    }
  },

  // Lấy danh sách review chờ duyệt
  getPendingReviews: async (params) => {
    try {
      const response = await axiosInstance.get('/reviews/pending', { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      return { reviews: [], total: 0 };
    }
  },

  // Cập nhật trạng thái báo cáo
  updateReportStatus: async (reportId, status, reason) => {
    try {
        const response = await axiosInstance.put(`/reports/${reportId}`, { status, reason });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
  },
  
  // Duyệt (approve/reject) một review
  processReview: async (reviewId, action) => {
    try {
        const response = await axiosInstance.put(`/reviews/${reviewId}/process`, { action });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
  }
};

export default moderatorService;
