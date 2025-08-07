import axiosInstance from './axiosInstance';

const reviewService = {
  // Lấy tất cả đánh giá của một nhà trọ
  getReviewsForAccommodation: async (accommodationId) => {
    try {
      const response = await axiosInstance.get(`/reviews/accommodation/${accommodationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo đánh giá mới
  createReview: async (reviewData) => {
    try {
      // reviewData should contain accommodationId, rating, comment, etc.
      const response = await axiosInstance.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật đánh giá
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await axiosInstance.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa đánh giá
  deleteReview: async (reviewId) => {
    try {
      const response = await axiosInstance.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy đánh giá của user hiện tại
  getMyReviews: async () => {
    try {
      const response = await axiosInstance.get('/reviews/my-reviews');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Moderator specific methods
  getPendingReviews: async () => {
    try {
      const response = await axiosInstance.get('/reviews/pending');
      return response.data;
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      return [];
    }
  },

  getProcessedReviews: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/reviews/processed', { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching processed reviews:", error);
      return { reviews: [], total: 0, totalPages: 0, currentPage: 1 };
    }
  },

  processReview: async (reviewId, action, reason = '') => {
    try {
      const response = await axiosInstance.put(`/reviews/${reviewId}/process`, { 
        action, 
        reason 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateReviewStatus: async (reviewId, status) => {
    try {
      const response = await axiosInstance.patch(`/reviews/${reviewId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default reviewService; 