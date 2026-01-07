import axios from 'axios';
import authService from './authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/accommodations';

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào request nếu có
axiosInstance.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const accommodationService = {
  // Lấy tất cả nhà trọ với filters
  getAll: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy nhà trọ theo ID
  getById: async (id) => {
    try {
      const response = await axiosInstance.get(`/${id}`);
      return response.data.accommodation;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Tạo nhà trọ mới
  create: async (accommodationData) => {
    try {
      const response = await axiosInstance.post('/', accommodationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật nhà trọ
  update: async (id, accommodationData) => {
    try {
      const response = await axiosInstance.put(`/${id}`, accommodationData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Xóa nhà trọ
  delete: async (id) => {
    try {
      const response = await axiosInstance.delete(`/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default accommodationService;

