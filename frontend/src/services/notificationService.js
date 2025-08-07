import axiosInstance from './axiosInstance';

const notificationService = {
  // Get all notifications
  getNotifications: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/notifications', { params });
      return response.data || { notifications: [] };
    } catch (error) {
      console.error('Error in getNotifications:', error);
      return { notifications: [] };
    }
  },

  // Get notification by ID
  getNotificationById: async (id) => {
    const response = await axiosInstance.get(`/notifications/${id}`);
    return response.data;
  },

  // Create new notification
  createNotification: async (notificationData) => {
    const response = await axiosInstance.post('/notifications', notificationData);
    return response.data;
  },

  // Update notification
  updateNotification: async (id, notificationData) => {
    const response = await axiosInstance.put(`/notifications/${id}`, notificationData);
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await axiosInstance.delete(`/notifications/${id}`);
    return response.data;
  },

  // Send notification
  sendNotification: async (id) => {
    const response = await axiosInstance.post(`/notifications/${id}/send`);
    return response.data;
  },

  // Get notification statistics
  getNotificationStats: async () => {
    const response = await axiosInstance.get('/notifications/stats');
    return response.data;
  },

  // Get all templates
  getTemplates: async (params = {}) => {
    const response = await axiosInstance.get('/notifications/templates', { params });
    return response.data;
  },

  // Get template by ID
  getTemplateById: async (id) => {
    const response = await axiosInstance.get(`/notifications/templates/${id}`);
    return response.data;
  },

  // Create new template
  createTemplate: async (templateData) => {
    const response = await axiosInstance.post('/notifications/templates', templateData);
    return response.data;
  },

  // Update template
  updateTemplate: async (id, templateData) => {
    const response = await axiosInstance.put(`/notifications/templates/${id}`, templateData);
    return response.data;
  },

  // Delete template
  deleteTemplate: async (id) => {
    const response = await axiosInstance.delete(`/notifications/templates/${id}`);
    return response.data;
  },

  // Toggle template status
  toggleTemplateStatus: async (id) => {
    const response = await axiosInstance.put(`/notifications/templates/${id}/toggle`);
    return response.data;
  },

  // Get template statistics
  getTemplateStats: async () => {
    const response = await axiosInstance.get('/notifications/templates/stats');
    return response.data;
  },

  // Get notification settings
  getNotificationSettings: async () => {
    const response = await axiosInstance.get('/notifications/settings');
    return response.data;
  },

  // Update notification settings
  updateNotificationSettings: async (settings) => {
    const response = await axiosInstance.put('/notifications/settings', settings);
    return response.data;
  }
};

export default notificationService; 