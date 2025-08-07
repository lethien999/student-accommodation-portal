import axiosInstance from './axiosInstance';

const advertisementService = {
  // Create a new advertisement
  createAdvertisement: async (adData) => {
    try {
      const response = await axiosInstance.post('/advertisements', adData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get all advertisements (for admin, có phân trang, tìm kiếm, lọc)
  getAdvertisements: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/advertisements', { params });
      // Đảm bảo trả về advertisements, total, page, pageSize
      if (Array.isArray(response.data.advertisements)) {
        return {
          advertisements: response.data.advertisements,
          total: response.data.total || response.data.advertisements.length,
          page: response.data.page || 1,
          pageSize: response.data.pageSize || 10
        };
      }
      return { advertisements: [], total: 0, page: 1, pageSize: 10 };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get a single advertisement by ID
  getAdvertisementById: async (id) => {
    try {
      const response = await axiosInstance.get(`/advertisements/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update an advertisement
  updateAdvertisement: async (id, adData) => {
    try {
      const response = await axiosInstance.put(`/advertisements/${id}`, adData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete an advertisement
  deleteAdvertisement: async (id) => {
    try {
      const response = await axiosInstance.delete(`/advertisements/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Record an impression
  recordImpression: async (id) => {
    try {
      await axiosInstance.get(`/advertisements/${id}/impression`);
    } catch (error) {
      console.error('Error recording impression:', error.response?.data || error.message);
    }
  },

  // Record a click and redirect
  recordClick: async (id) => {
    try {
      const response = await axiosInstance.get(`/advertisements/${id}/click`);
      // The backend will handle the redirect, so we don't do anything here.
      return response.data; 
    } catch (error) {
      console.error('Error recording click:', error.response?.data || error.message);
      throw error.response?.data || error.message;
    }
  },

  // Get user's advertisements (for landlord/admin dashboard)
  getUserAdvertisements: async () => {
    try {
      const response = await axiosInstance.get('/advertisements/my-ads'); // Assuming this route exists or will be created
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Approve/Reject an advertisement (admin only)
  approveAdvertisement: async (id, status) => {
    try {
      const response = await axiosInstance.put(`/advertisements/${id}/approve`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get active advertisements for public display
  getActiveAdvertisements: async () => {
    try {
      const response = await axiosInstance.get('/advertisements/active');
      return response.data; // Should return an array of ads
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default advertisementService;