import axiosInstance from './axiosInstance';

const favoriteService = {
  getFavorites: async () => {
    try {
      const response = await axiosInstance.get('/favorites');
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  },

  addToFavorites: async (accommodationId) => {
    try {
      const response = await axiosInstance.post('/favorites', { accommodationId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  removeFromFavorites: async (accommodationId) => {
    try {
      const response = await axiosInstance.delete(`/favorites/${accommodationId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default favoriteService; 