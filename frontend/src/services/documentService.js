import axiosInstance from './axiosInstance';

const documentService = {
  getDocuments: async (params = {}) => {
    try {
      const res = await axiosInstance.get('/documents', { params });
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error('Error in getDocuments:', error);
      return [];
    }
  },
  uploadDocument: async (data) => {
    const res = await axiosInstance.post('/documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  signDocument: async (id) => {
    const res = await axiosInstance.post(`/documents/${id}/sign`);
    return res.data;
  },
  downloadDocument: async (id) => {
    const res = await axiosInstance.get(`/documents/${id}/download`, { responseType: 'blob' });
    return res.data;
  },
  deleteDocument: async (id) => {
    const res = await axiosInstance.delete(`/documents/${id}`);
    return res.data;
  }
};

export default documentService; 