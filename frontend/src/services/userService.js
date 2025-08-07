import axiosInstance from './axiosInstance';

const userService = {
  // Lấy danh sách người dùng (cho admin)
  getUsers: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/users', { params });
      return response.data || { users: [] };
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error.response?.data || error.message || 'Lỗi khi lấy danh sách người dùng';
    }
  },

  // Lấy thông tin người dùng hiện tại
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/users/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật thông tin người dùng
  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Đổi mật khẩu
  changePassword: async (passwordData) => {
    try {
      const response = await axiosInstance.put('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Yêu cầu xác minh chủ nhà
  requestLandlordVerification: async (verificationData) => {
    try {
      const response = await axiosInstance.post('/users/verify-landlord', verificationData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách yêu cầu xác minh (cho admin)
  getVerificationRequests: async () => {
    try {
      const response = await axiosInstance.get('/users/verification-requests');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Cập nhật trạng thái yêu cầu xác minh (cho admin)
  updateVerificationRequest: async (requestId, status, reason) => {
    try {
      const response = await axiosInstance.put(`/users/verification-requests/${requestId}`, {
        status,
        reason,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Lấy dữ liệu tổng quan cho dashboard của người thuê
  getTenantDashboardStats: async () => {
    try {
      // Backend cần endpoint /users/tenant/stats
      const response = await axiosInstance.get('/users/tenant/stats');
      return response.data;
    } catch (error) {
      console.error("Error fetching tenant stats:", error);
      // Fallback data
      return {
        stats: {
          bookings: { count: 0 },
          favorites: { count: 0 },
          reviews: { count: 0 },
        },
        recentActivities: [],
        favoriteAccommodations: [],
        bookingHistory: [],
      };
    }
  },

  // Lấy lịch sử đặt phòng
  getBookingHistory: async () => {
    try {
      const response = await axiosInstance.get('/users/booking-history');
      return response.data;
    } catch (error) {
      console.error("Error fetching booking history:", error);
      return [];
    }
  },

  // Lấy danh sách khách thuê của chủ nhà
  getLandlordTenants: async () => {
    try {
      const response = await axiosInstance.get('/users/landlord/tenants');
      return response.data;
    } catch (error) {
      console.error("Error fetching landlord tenants:", error);
      return [];
    }
  },

  // Quản lý nhóm người dùng
  getUserGroups: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/roles/groups', { params });
      return response.data || { groups: [] };
    } catch (error) {
      console.error('Error in getUserGroups:', error);
      throw error.response?.data || error.message || 'Lỗi khi lấy danh sách nhóm người dùng';
    }
  },

  createUserGroup: async (groupData) => {
    const response = await axiosInstance.post('/roles/groups', groupData);
    return response.data;
  },

  updateUserGroup: async (id, groupData) => {
    const response = await axiosInstance.put(`/roles/groups/${id}`, groupData);
    return response.data;
  },

  deleteUserGroup: async (id) => {
    const response = await axiosInstance.delete(`/roles/groups/${id}`);
    return response.data;
  },

  getGroupMembers: async (groupId) => {
    try {
      const response = await axiosInstance.get(`/roles/groups/${groupId}/members`);
      return response.data || { members: [] };
    } catch (error) {
      console.error('Error in getGroupMembers:', error);
      throw error.response?.data || error.message || 'Lỗi khi lấy thành viên nhóm';
    }
  },

  addGroupMember: async (groupId, userId) => {
    const response = await axiosInstance.post(`/roles/groups/${groupId}/members`, { userId });
    return response.data;
  },

  removeGroupMember: async (groupId, userId) => {
    const response = await axiosInstance.delete(`/roles/groups/${groupId}/members/${userId}`);
    return response.data;
  },
};

export default userService; 