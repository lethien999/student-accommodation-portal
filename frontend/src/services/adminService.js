import axiosInstance from './axiosInstance';

// Lấy các thống kê tổng quan (số lượng users, ads, news...)
export const getOverviewStats = async () => {
  try {
    const response = await axiosInstance.get('/admin/stats'); 
    return response.data;
  } catch (error) {
    console.error("Error fetching overview stats:", error);
    // Trả về dữ liệu mặc định để không làm crash UI
    return {
      advertisements: { count: 0, change: 0 },
      news: { count: 0, change: 0 },
      users: { count: 0, change: 0 },
      revenue: { count: 0, change: 0 },
    };
  }
};

// Lấy các hoạt động gần đây
export const getRecentActivities = async () => {
    try {
        const response = await axiosInstance.get('/admin/recent-activities');
        return response.data;
    } catch (error) {
        console.error("Error fetching recent activities:", error);
        return [];
    }
}

// Lấy danh sách người dùng
export const getUsers = async (params = {}) => {
    try {
        const response = await axiosInstance.get('/admin/users', { params });
        // Đảm bảo trả về users, total, page, pageSize
        if (Array.isArray(response.data.users)) {
            return {
                users: response.data.users,
                total: response.data.total || response.data.users.length,
                page: response.data.page || 1,
                pageSize: response.data.pageSize || 10
            };
        }
        return { users: [], total: 0, page: 1, pageSize: 10 };
    } catch (error) {
        console.error("Error fetching users:", error);
        return { users: [], total: 0, page: 1, pageSize: 10 };
    }
}

export const deleteUser = async (userId) => {
    try {
        const response = await axiosInstance.delete(`/admin/users/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const lockUser = async (userId, lock) => {
    try {
        const response = await axiosInstance.put(`/admin/users/${userId}/lock`, { lock });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const updateUserRole = async (userId, role) => {
    try {
        const response = await axiosInstance.put(`/admin/users/${userId}/role`, { role });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const adminService = { 
    getOverviewStats,
    getRecentActivities,
    getUsers,
    deleteUser,
    lockUser,
    updateUserRole,
};
export default adminService; 