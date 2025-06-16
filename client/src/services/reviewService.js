import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reviews';

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào request nếu có
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const reviewService = {
  // Lấy tất cả đánh giá của một nhà trọ
  getByAccommodation: async (accommodationId) => {
    try {
      const response = await axiosInstance.get(`/accommodation/${accommodationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo đánh giá mới
  create: async (reviewData) => {
    try {
      const response = await axiosInstance.post('/', reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật đánh giá
  update: async (id, reviewData) => {
    try {
      const response = await axiosInstance.put(`/${id}`, reviewData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa đánh giá
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default reviewService; 