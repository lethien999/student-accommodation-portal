import axiosInstance from './axiosInstance';

const roleService = {
  // Role management
  getAllRoles: async () => {
    try {
      const response = await axiosInstance.get('/roles/roles');
      return response.data || [];
    } catch (error) {
      console.error('Error in getAllRoles:', error);
      return [];
    }
  },

  createRole: async (roleData) => {
    const response = await axiosInstance.post('/roles/roles', roleData);
    return response.data;
  },

  updateRole: async (roleId, roleData) => {
    const response = await axiosInstance.put(`/roles/roles/${roleId}`, roleData);
    return response.data;
  },

  deleteRole: async (roleId) => {
    const response = await axiosInstance.delete(`/roles/roles/${roleId}`);
    return response.data;
  },

  // Permission management
  getAllPermissions: async () => {
    try {
      const response = await axiosInstance.get('/roles/permissions');
      return response.data || [];
    } catch (error) {
      console.error('Error in getAllPermissions:', error);
      return [];
    }
  },

  createPermission: async (permissionData) => {
    const response = await axiosInstance.post('/roles/permissions', permissionData);
    return response.data;
  },

  // User group management
  getUserGroups: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/roles/groups', { params });
      return response.data || { groups: [] };
    } catch (error) {
      console.error('Error in getUserGroups:', error);
      return { groups: [] };
    }
  },

  createUserGroup: async (groupData) => {
    const response = await axiosInstance.post('/roles/groups', groupData);
    return response.data;
  },

  updateUserGroup: async (groupId, groupData) => {
    const response = await axiosInstance.put(`/roles/groups/${groupId}`, groupData);
    return response.data;
  },

  deleteUserGroup: async (groupId) => {
    const response = await axiosInstance.delete(`/roles/groups/${groupId}`);
    return response.data;
  }
};

export default roleService; 