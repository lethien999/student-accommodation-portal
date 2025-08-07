import axiosInstance from './axiosInstance';

const activityService = {
  // Get activity logs
  getActivityLogs: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/activities/activities', { params });
      return response.data || { logs: [] };
    } catch (error) {
      console.error('Error in getActivityLogs:', error);
      return { logs: [] };
    }
  },

  getUserActivityLogs: async (userId, params = {}) => {
    try {
      const response = await axiosInstance.get(`/activities/users/${userId}/activities`, { params });
      return response.data || { logs: [] };
    } catch (error) {
      console.error('Error in getUserActivityLogs:', error);
      return { logs: [] };
    }
  },

  // Get activity statistics
  getActivityStats: async (params = {}) => {
    const response = await axiosInstance.get('/activities/activities/stats', { params });
    return response.data;
  },

  // Export activity logs
  exportActivityLogs: async (params = {}) => {
    const response = await axiosInstance.get('/activities/activities/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Get available actions and modules
  getAvailableActions: async () => {
    try {
      const response = await axiosInstance.get('/activities/activities/actions');
      return response.data || [];
    } catch (error) {
      console.error('Error in getAvailableActions:', error);
      return [];
    }
  },

  getAvailableModules: async () => {
    try {
      const response = await axiosInstance.get('/activities/activities/modules');
      return response.data || [];
    } catch (error) {
      console.error('Error in getAvailableModules:', error);
      return [];
    }
  },

  // Cleanup old logs (admin only)
  cleanupOldLogs: async (days = 90) => {
    const response = await axiosInstance.delete('/activities/activities/cleanup', {
      params: { days }
    });
    return response.data;
  }
};

export default activityService; 