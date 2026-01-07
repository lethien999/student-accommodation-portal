import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/users';

// Tạo instance axios với cấu hình mặc định
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào request nếu có
axiosInstance.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authService = {
  // Đăng ký
  register: async (userData) => {
    try {
      const response = await axiosInstance.post('/register', userData);
      if (response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng nhập
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post('/login', { email, password });
      if (response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Lấy token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Lưu token
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  // Lấy user hiện tại
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Lưu user
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    return !!getToken();
  },

  // Lấy profile
  getProfile: async () => {
    try {
      const response = await axiosInstance.get('/profile');
      if (response.data.user) {
        setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật profile
  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put('/profile', userData);
      if (response.data.user) {
        setUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đổi mật khẩu
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await axiosInstance.put('/password', {
        currentPassword,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

// Helper functions
const getToken = () => {
  return localStorage.getItem('token');
};

const setToken = (token) => {
  localStorage.setItem('token', token);
};

const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export default authService;

