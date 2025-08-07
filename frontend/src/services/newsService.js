import axiosInstance from './axiosInstance';

const newsService = {
  // News Articles
  createNews: async (newsData) => {
    try {
      const response = await axiosInstance.post('/news', newsData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getNews: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/news', { params });
      return response.data || { news: [], pagination: { totalPages: 1, totalItems: 0 } };
    } catch (error) {
      console.error('Error in getNews:', error);
      throw error.response?.data || error.message || 'Lỗi khi lấy danh sách tin tức';
    }
  },

  getNewsBySlug: async (slug) => {
    try {
      const response = await axiosInstance.get(`/news/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getNewsById: async (id) => {
    try {
      const response = await axiosInstance.get(`/news/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateNews: async (id, newsData) => {
    try {
      const response = await axiosInstance.put(`/news/${id}`, newsData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteNews: async (id) => {
    try {
      const response = await axiosInstance.delete(`/news/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  approveNews: async (id, data) => {
    try {
      const response = await axiosInstance.put(`/news/${id}/approve`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getRelatedNews: async (id, params = {}) => {
    try {
      const response = await axiosInstance.get(`/news/${id}/related`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getNewsStats: async () => {
    try {
      const response = await axiosInstance.get('/news/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // News Categories
  createCategory: async (categoryData) => {
    try {
      const response = await axiosInstance.post('/news/categories', categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCategories: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/news/categories', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCategoryBySlug: async (slug, params = {}) => {
    try {
      const response = await axiosInstance.get(`/news/categories/${slug}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCategoryById: async (id) => {
    try {
      const response = await axiosInstance.get(`/news/categories/id/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateCategory: async (id, categoryData) => {
    try {
      const response = await axiosInstance.put(`/news/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteCategory: async (id) => {
    try {
      const response = await axiosInstance.delete(`/news/categories/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCategoryTree: async () => {
    try {
      const response = await axiosInstance.get('/news/categories/tree');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // News Comments
  createComment: async (newsId, commentData) => {
    try {
      const response = await axiosInstance.post(`/news/${newsId}/comments`, commentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getComments: async (newsId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/news/${newsId}/comments`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateComment: async (commentId, commentData) => {
    try {
      const response = await axiosInstance.put(`/news/comments/${commentId}`, commentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteComment: async (commentId) => {
    try {
      const response = await axiosInstance.delete(`/news/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  approveComment: async (commentId, data) => {
    try {
      const response = await axiosInstance.put(`/news/comments/${commentId}/approve`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllComments: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/news/comments', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getCommentStats: async () => {
    try {
      const response = await axiosInstance.get('/news/comments/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Upload news image
  uploadNewsImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axiosInstance.post('/upload/news-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Bulk operations
  bulkUpdateNews: async (ids, data) => {
    try {
      const response = await axiosInstance.put('/news/bulk-update', {
        ids,
        data
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  bulkDeleteNews: async (ids) => {
    try {
      const response = await axiosInstance.delete('/news/bulk-delete', {
        data: { ids }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Export data
  exportNewsData: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/news/export', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh mục tin tức
  getNewsCategories: async () => {
    try {
      const response = await axiosInstance.get('/news/categories');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default newsService; 