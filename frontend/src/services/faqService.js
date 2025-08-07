import axiosInstance from './axiosInstance';

const faqService = {
  // Lấy danh sách FAQ
  getFAQs: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/faqs', { params });
      return response.data || { faqs: [] };
    } catch (error) {
      console.error('Error in getFAQs:', error);
      return { faqs: [] };
    }
  },

  // Lấy chi tiết FAQ
  getFAQById: async (id) => {
    try {
      const response = await axiosInstance.get(`/faqs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo FAQ mới
  createFAQ: async (faqData) => {
    try {
      const response = await axiosInstance.post('/faqs', faqData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật FAQ
  updateFAQ: async (id, faqData) => {
    try {
      const response = await axiosInstance.put(`/faqs/${id}`, faqData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa FAQ
  deleteFAQ: async (id) => {
    try {
      const response = await axiosInstance.delete(`/faqs/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy FAQ theo danh mục
  getFAQsByCategory: async (category) => {
    try {
      const response = await axiosInstance.get(`/faqs/category/${category}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tìm kiếm FAQ
  searchFAQs: async (query) => {
    try {
      const response = await axiosInstance.get('/faqs/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default faqService; 