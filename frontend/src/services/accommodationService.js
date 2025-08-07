import axiosInstance from './axiosInstance';

const accommodationService = {
    // Lấy tất cả nhà trọ (có phân trang, filter) - Dùng cho trang tìm kiếm chung
    searchAccommodations: async (params) => {
        try {
            const response = await axiosInstance.get('/accommodations/search', { params });
            return response.data || { accommodations: [] };
        } catch (error) {
            console.error('Error in searchAccommodations:', error);
            throw error.response?.data || error.message || 'Lỗi khi tìm kiếm nhà trọ';
        }
    },

    // Lấy tất cả nhà trọ (cho admin/management)
    getAccommodations: async (params = {}) => {
        try {
            const response = await axiosInstance.get('/accommodations', { params });
            // Đảm bảo luôn trả về object có accommodations là mảng
            if (response.data && Array.isArray(response.data.accommodations)) {
                return response.data;
            } else if (Array.isArray(response.data)) {
                return { accommodations: response.data };
            } else {
                return { accommodations: [] };
            }
        } catch (error) {
            console.error('Error in getAccommodations:', error);
            throw error.response?.data || error.message || 'Lỗi khi lấy danh sách nhà trọ';
        }
    },

    // Lấy chi tiết một nhà trọ
    getAccommodationDetails: async (id) => {
        try {
            const response = await axiosInstance.get(`/accommodations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy các nhà trọ của chủ nhà đang đăng nhập
    getMyAccommodations: async (params) => {
        try {
            const response = await axiosInstance.get('/accommodations/my-accommodations', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Lấy các nhà trọ của chủ nhà (alias cho getMyAccommodations)
    getLandlordAccommodations: async (params) => {
        try {
            const response = await axiosInstance.get('/accommodations/my-accommodations', { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching landlord accommodations:", error);
            return [];
        }
    },

    // Lấy dữ liệu tổng quan cho dashboard của chủ nhà
    getLandlordDashboardStats: async () => {
        try {
            const response = await axiosInstance.get('/accommodations/landlord/stats');
            return response.data;
        } catch (error) {
            console.error("Error fetching landlord stats:", error);
            // Fallback data
            return {
                stats: {
                    accommodations: { count: 0 },
                    revenue: { count: 0 },
                    tenants: { count: 0 },
                },
                recentBookings: []
            };
        }
    },
    
    // Tạo nhà trọ mới
    createAccommodation: async (accommodationData) => {
        try {
            const response = await axiosInstance.post('/accommodations', accommodationData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Cập nhật nhà trọ
    updateAccommodation: async (id, accommodationData) => {
        try {
            const response = await axiosInstance.put(`/accommodations/${id}`, accommodationData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Xóa nhà trọ
    deleteAccommodation: async (id) => {
        try {
            const response = await axiosInstance.delete(`/accommodations/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default accommodationService;