import axiosInstance from './axiosInstance';

const rentalContractService = {
  // Lấy danh sách hợp đồng
  getRentalContracts: async (params = {}) => {
    const response = await axiosInstance.get('/rental-contracts', { params });
    return response.data;
  },

  // Lấy chi tiết hợp đồng
  getRentalContract: async (id) => {
    const response = await axiosInstance.get(`/rental-contracts/${id}`);
    return response.data;
  },

  // Tạo hợp đồng mới
  createRentalContract: async (contractData) => {
    const response = await axiosInstance.post('/rental-contracts', contractData);
    return response.data;
  },

  // Cập nhật hợp đồng
  updateRentalContract: async (id, contractData) => {
    const response = await axiosInstance.put(`/rental-contracts/${id}`, contractData);
    return response.data;
  },

  // Xóa hợp đồng
  deleteRentalContract: async (id) => {
    const response = await axiosInstance.delete(`/rental-contracts/${id}`);
    return response.data;
  },

  // Upload file hợp đồng
  uploadContractFile: async (id, contractFile) => {
    const response = await axiosInstance.put(`/rental-contracts/${id}/upload`, { contractFile });
    return response.data;
  },

  // Lấy danh sách hợp đồng của chủ nhà
  getLandlordContracts: async () => {
    try {
      const response = await axiosInstance.get('/rental-contracts/landlord');
      return response.data;
    } catch (error) {
      console.error("Error fetching landlord contracts:", error);
      return [];
    }
  },

  // Lấy các hợp đồng đang hoạt động của người thuê
  getMyActiveContracts: async () => {
    try {
      const response = await axiosInstance.get('/rental-contracts/my-active');
      return response.data;
    } catch (error) {
        console.error("Error fetching my active contracts:", error);
        return [];
    }
  },

  // Ký hợp đồng số
  signContract: async (id, signData) => {
    const response = await axiosInstance.post(`/rental-contracts/${id}/sign`, signData);
    return response.data;
  },

  // Lấy file hợp đồng đã ký
  getSignedContractFile: async (id) => {
    const response = await axiosInstance.get(`/rental-contracts/${id}/signed-file`, { responseType: 'blob' });
    return response.data;
  },

  downloadContractPDF: async (id) => {
    const response = await axiosInstance.get(`/rental-contracts/${id}/download-pdf`, { responseType: 'blob' });
    return response.data;
  }
};

export default rentalContractService; 