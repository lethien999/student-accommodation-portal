import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

const getAdminStats = async () => {
    const response = await axios.get(`${BASE_URL}/dashboard/admin`, getAuthHeader());
    return response.data;
};

const getLandlordStats = async () => {
    const response = await axios.get(`${BASE_URL}/dashboard/landlord`, getAuthHeader());
    return response.data;
};

const getSaleStats = async () => {
    const response = await axios.get(`${BASE_URL}/dashboard/sale`, getAuthHeader());
    return response.data;
};

const dashboardService = {
    getAdminStats,
    getLandlordStats,
    getSaleStats
};

export default dashboardService;
