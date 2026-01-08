import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const bookingService = {
    create: async (data) => {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/bookings`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getMyBookings: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/bookings/my-bookings`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    },

    getLandlordRequests: async () => {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/bookings/landlord-requests`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data; // expects { success, results, bookings }
    },

    updateStatus: async (id, status) => {
        const token = localStorage.getItem('token');
        const response = await axios.patch(`${API_URL}/bookings/${id}/status`, { status }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    }
};

export default bookingService;
