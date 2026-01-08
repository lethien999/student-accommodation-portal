import axiosInstance from '../utils/axiosConfig';

const createReport = async (data) => {
    const response = await axiosInstance.post('/verification', data);
    return response.data.data;
};

const getReports = async (params) => {
    const response = await axiosInstance.get('/verification', { params });
    return response.data;
};

const approveReport = async (id, adminComment) => {
    const response = await axiosInstance.put(`/verification/${id}/approve`, { adminComment });
    return response.data.data;
};

const rejectReport = async (id, adminComment) => {
    const response = await axiosInstance.put(`/verification/${id}/reject`, { adminComment });
    return response.data.data;
};

const verificationService = {
    createReport,
    getReports,
    approveReport,
    rejectReport
};

export default verificationService;
