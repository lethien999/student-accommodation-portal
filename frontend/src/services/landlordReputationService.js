import axiosInstance from './axiosInstance';

const landlordReputationService = {
  /**
   * Fetches the reputation data for a specific landlord.
   * @param {string} landlordId The ID of the landlord.
   * @returns {Promise<object>}
   */
  getReputation: async (landlordId) => {
    try {
      const response = await axiosInstance.get(`/landlords/${landlordId}/reputation`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching reputation for landlord ${landlordId}:`, error);
      throw error.response?.data || error.message;
    }
  },
};

export default landlordReputationService; 