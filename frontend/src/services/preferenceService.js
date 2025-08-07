import axiosInstance from './axiosInstance';

const preferenceService = {
  // Get user preferences
  getUserPreferences: async (userId = null) => {
    try {
      const url = userId ? `/preferences/by-user/${userId}` : '/preferences';
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      throw error;
    }
  },

  getPreferencesByCategory: async (category, userId = null) => {
    try {
      const url = userId 
        ? `/preferences/by-user/${userId}/${category}`
        : `/preferences/${category}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error in getPreferencesByCategory:', error);
      throw error;
    }
  },

  getPreference: async (category, key, userId = null) => {
    try {
      const url = userId 
        ? `/preferences/by-user/${userId}/${category}/${key}`
        : `/preferences/${category}/${key}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error in getPreference:', error);
      throw error;
    }
  },

  // Set user preferences
  setPreference: async (preferenceData, userId = null) => {
    try {
      const url = userId ? `/preferences/by-user/${userId}` : '/preferences';
      const response = await axiosInstance.post(url, preferenceData);
      return response.data;
    } catch (error) {
      console.error('Error in setPreference:', error);
      throw error;
    }
  },

  setMultiplePreferences: async (preferences, userId = null) => {
    try {
      const url = userId 
        ? `/preferences/by-user/${userId}/multiple`
        : '/preferences/multiple';
      const response = await axiosInstance.post(url, { preferences });
      return response.data;
    } catch (error) {
      console.error('Error in setMultiplePreferences:', error);
      throw error;
    }
  },

  // Delete user preferences
  deletePreference: async (category, key, userId = null) => {
    try {
      const url = userId 
        ? `/preferences/by-user/${userId}/${category}/${key}`
        : `/preferences/${category}/${key}`;
      const response = await axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      console.error('Error in deletePreference:', error);
      throw error;
    }
  },

  resetPreferences: async (category = null, userId = null) => {
    try {
      const url = userId 
        ? `/preferences/by-user/${userId}/reset${category ? `/${category}` : ''}`
        : `/preferences/reset${category ? `/${category}` : ''}`;
      const response = await axiosInstance.delete(url);
      return response.data;
    } catch (error) {
      console.error('Error in resetPreferences:', error);
      throw error;
    }
  },

  // Get default preferences
  getDefaultPreferences: async () => {
    try {
      const response = await axiosInstance.get('/preferences/defaults');
      return response.data;
    } catch (error) {
      console.error('Error in getDefaultPreferences:', error);
      throw error;
    }
  }
};

export default preferenceService; 