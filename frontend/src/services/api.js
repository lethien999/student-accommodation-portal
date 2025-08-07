import axios from 'axios';
import { logout } from './authService';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable sending cookies with requests
});

// Add a request interceptor to include CSRF token
api.interceptors.request.use(
  async (config) => {
    // Only fetch CSRF token if it's a non-GET request and no X-CSRF-Token is present
    if (config.method !== 'get' && !config.headers['X-CSRF-Token']) {
      try {
        const { data } = await api.get('/v1/users/csrf-token'); // Corrected path
        config.headers['X-CSRF-Token'] = data.csrfToken;
      } catch (error) {
        console.error('Failed to get CSRF token:', error.response?.data || error.message);
        // If CSRF token fetching fails, reject the request
        return Promise.reject(error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle CSRF token errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 403 Forbidden specifically for CSRF token issues
    if (error.response?.status === 403 && error.response.data?.error?.includes('CSRF') && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Attempt to get a new CSRF token
        const { data } = await api.get('/v1/users/csrf-token'); // Corrected path
        originalRequest.headers['X-CSRF-Token'] = data.csrfToken;
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (csrfError) {
        console.error('Failed to get new CSRF token on 403 retry:', csrfError.response?.data || csrfError.message);
        // If getting a new CSRF token fails, log out the user
        if (csrfError.response?.status === 403) {
          logout();
        }
        return Promise.reject(csrfError);
      }
    }

    // Handle 401 Unauthorized globally for other requests
    if (error.response?.status === 401) {
      // Check if it's a login/register failure specifically for credentials, not just expired token
      if (originalRequest.url !== '/users/login' && originalRequest.url !== '/users') {
        logout();
      }
    }

    return Promise.reject(error);
  }
);

export default api; 