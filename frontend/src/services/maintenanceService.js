import axiosInstance from './axiosInstance';

const maintenanceService = {
  /**
   * Creates a new maintenance request with image upload.
   * @param {FormData} formData - The form data including images.
   */
  createRequest: async (formData) => {
    try {
      const response = await axiosInstance.post('/maintenance', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data || {};
    } catch (error) {
      console.error('Error in createRequest:', error);
      throw error.response?.data || error.message || 'Lỗi khi tạo yêu cầu bảo trì';
    }
  },

  /**
   * Fetches maintenance requests based on user role.
   * No params needed as backend determines scope from user token.
   */
  getRequests: async () => {
    try {
      const response = await axiosInstance.get('/maintenance');
      return response.data || { requests: [] };
    } catch (error) {
      console.error('Error in getRequests:', error);
      return { requests: [] };
    }
  },

  /**
   * Fetches the details of a single maintenance request.
   * @param {string} id - The ID of the request.
   */
  getRequestDetails: async (id) => {
    try {
      const response = await axiosInstance.get(`/maintenance/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error in getRequestDetails:', error);
      return {};
    }
  },

  /**
   * Updates a maintenance request with optional image upload.
   * @param {string} id - The ID of the request to update.
   * @param {FormData|object} updateData - The data to update (FormData if images, object if no images).
   */
  updateRequest: async (id, updateData) => {
    try {
      const headers = {};
      if (updateData instanceof FormData) {
        headers['Content-Type'] = 'multipart/form-data';
      }
      
      const response = await axiosInstance.put(`/maintenance/${id}`, updateData, { headers });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Deletes a maintenance request.
   * @param {string} id - The ID of the request to delete.
   */
  deleteRequest: async (id) => {
    try {
      const response = await axiosInstance.delete(`/maintenance/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Gets maintenance statistics.
   */
  getMaintenanceStats: async () => {
    try {
      const response = await axiosInstance.get('/maintenance/stats/overview');
      return response.data;
    } catch (error) {
      console.error('Error in getMaintenanceStats:', error);
      return {};
    }
  },

  /**
   * Upload a single image for maintenance request.
   * @param {File} file - The image file to upload.
   */
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axiosInstance.post('/upload/maintenance-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default maintenanceService; 