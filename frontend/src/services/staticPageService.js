import axiosInstance from './axiosInstance';

const staticPageService = {
  // Lấy danh sách trang tĩnh
  getStaticPages: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/static-pages', { params });
      return response.data || { staticPages: [] };
    } catch (error) {
      console.error('Error in getStaticPages:', error);
      return { staticPages: [] };
    }
  },

  // Lấy chi tiết trang tĩnh
  getStaticPageById: async (id) => {
    try {
      const response = await axiosInstance.get(`/static-pages/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy trang tĩnh theo slug
  getStaticPageBySlug: async (slug) => {
    try {
      const response = await axiosInstance.get(`/static-pages/slug/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo trang tĩnh mới
  createStaticPage: async (pageData) => {
    try {
      const response = await axiosInstance.post('/static-pages', pageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật trang tĩnh
  updateStaticPage: async (id, pageData) => {
    try {
      const response = await axiosInstance.put(`/static-pages/${id}`, pageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa trang tĩnh
  deleteStaticPage: async (id) => {
    try {
      const response = await axiosInstance.delete(`/static-pages/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default staticPageService; 