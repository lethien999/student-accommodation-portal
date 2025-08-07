import axiosInstance from './axiosInstance';

const eventService = {
  getEvents: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/events', { params });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error in getEvents:', error);
      return [];
    }
  },
  getEvent: async (id) => {
    try {
      const response = await axiosInstance.get(`/events/${id}`);
      return response.data || {};
    } catch (error) {
      console.error('Error in getEvent:', error);
      return {};
    }
  },
  createEvent: async (data) => {
    const response = await axiosInstance.post('/events', data);
    return response.data;
  },
  updateEvent: async (id, data) => {
    const response = await axiosInstance.put(`/events/${id}`, data);
    return response.data;
  },
  deleteEvent: async (id) => {
    const response = await axiosInstance.delete(`/events/${id}`);
    return response.data;
  }
};

export default eventService; 