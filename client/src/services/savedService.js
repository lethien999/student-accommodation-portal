import axiosInstance from '../utils/axiosConfig';

const savedService = {
    // Toggle save status
    toggleSave: async (accommodationId) => {
        try {
            const response = await axiosInstance.post('/favorites/toggle', { accommodationId });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get list of saved accommodations
    getSavedList: async () => {
        try {
            const response = await axiosInstance.get('/favorites');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Check specific status
    checkStatus: async (accommodationId) => {
        try {
            const response = await axiosInstance.get(`/favorites/check/${accommodationId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export default savedService;
