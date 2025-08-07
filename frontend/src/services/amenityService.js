import axiosInstance from './axiosInstance';

const amenityService = {
  // Lấy danh sách tiện ích
  getAmenities: async () => {
    try {
      const response = await axiosInstance.get('/amenities');
      return response.data.amenities || [];
    } catch (error) {
      console.error('Error in getAmenities:', error);
      return [];
    }
  },

  // Lấy chi tiết tiện ích
  getAmenity: async (id) => {
    try {
      const response = await axiosInstance.get(`/amenities/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error in getAmenity:', error);
      return {};
    }
  },

  // Tạo tiện ích mới
  createAmenity: async (amenityData) => {
    const response = await axiosInstance.post('/amenities', amenityData);
    return response.data;
  },

  // Cập nhật tiện ích
  updateAmenity: async (id, amenityData) => {
    const response = await axiosInstance.put(`/amenities/${id}`, amenityData);
    return response.data;
  },

  // Xóa tiện ích
  deleteAmenity: async (id) => {
    const response = await axiosInstance.delete(`/amenities/${id}`);
    return response.data;
  },

  // Lấy tiện ích của accommodation
  getAccommodationAmenities: async (accommodationId) => {
    try {
      const response = await axiosInstance.get(`/amenities/accommodation/${accommodationId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error in getAccommodationAmenities:', error);
      return [];
    }
  },

  // Thêm tiện ích cho accommodation
  addAmenityToAccommodation: async (accommodationId, amenityId) => {
    const response = await axiosInstance.post('/amenities/accommodation', {
      accommodationId,
      amenityId
    });
    return response.data;
  },

  // Xóa tiện ích khỏi accommodation
  removeAmenityFromAccommodation: async (accommodationId, amenityId) => {
    const response = await axiosInstance.delete(`/amenities/accommodation/${accommodationId}/${amenityId}`);
    return response.data;
  }
};

export default amenityService; 