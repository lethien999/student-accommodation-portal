const { Role, Permission, RolePermission, User, UserGroup, GroupRole, UserActivityLog } = require('../models');
const { Op } = require('sequelize');

// Lấy danh sách tất cả vai trò
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: Permission,
          as: 'permissions',
          through: { attributes: [] }
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json(roles);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách vai trò:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Tạo vai trò mới
const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // Kiểm tra vai trò đã tồn tại
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ error: 'Vai trò đã tồn tại' });
    }

    // Tạo vai trò mới
    const role = await Role.create({
      name,
      description,
      isSystem: false
    });

    // Gán quyền cho vai trò
    if (permissions && permissions.length > 0) {
      const permissionInstances = await Permission.findAll({
        where: { id: { [Op.in]: permissions } }
      });
      await role.setPermissions(permissionInstances);
    }

    // Log hoạt động
    await UserActivityLog.create({
      userId: req.user.id,
      action: 'create',
      module: 'role',
      resourceId: role.id,
      resourceType: 'Role',
      details: { roleName: name, permissions },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json(role);
  } catch (error) {
    console.error('Lỗi khi tạo vai trò:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Cập nhật vai trò
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Vai trò không tồn tại' });
    }

    // Không cho phép cập nhật vai trò hệ thống
    if (role.isSystem) {
      return res.status(403).json({ error: 'Không thể cập nhật vai trò hệ thống' });
    }

    // Cập nhật thông tin vai trò
    await role.update({ name, description });

    // Cập nhật quyền
    if (permissions) {
      const permissionInstances = await Permission.findAll({
        where: { id: { [Op.in]: permissions } }
      });
      await role.setPermissions(permissionInstances);
    }

    // Log hoạt động
    await UserActivityLog.create({
      userId: req.user.id,
      action: 'update',
      module: 'role',
      resourceId: role.id,
      resourceType: 'Role',
      details: { roleName: name, permissions },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(role);
  } catch (error) {
    console.error('Lỗi khi cập nhật vai trò:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Xóa vai trò
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Vai trò không tồn tại' });
    }

    // Không cho phép xóa vai trò hệ thống
    if (role.isSystem) {
      return res.status(403).json({ error: 'Không thể xóa vai trò hệ thống' });
    }

    // Kiểm tra xem có user nào đang sử dụng vai trò này không
    const usersWithRole = await User.count({
      include: [
        {
          model: Role,
          as: 'roles',
          where: { id }
        }
      ]
    });

    if (usersWithRole > 0) {
      return res.status(400).json({ 
        error: `Không thể xóa vai trò. Có ${usersWithRole} người dùng đang sử dụng vai trò này.` 
      });
    }

    // Log hoạt động trước khi xóa
    await UserActivityLog.create({
      userId: req.user.id,
      action: 'delete',
      module: 'role',
      resourceId: role.id,
      resourceType: 'Role',
      details: { roleName: role.name },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await role.destroy();
    res.json({ message: 'Xóa vai trò thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa vai trò:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy danh sách tất cả quyền
const getAllPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [['module', 'ASC'], ['name', 'ASC']]
    });

    // Nhóm quyền theo module
    const groupedPermissions = permissions.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    }, {});

    res.json(groupedPermissions);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách quyền:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Tạo quyền mới
const createPermission = async (req, res) => {
  try {
    const { name, description, module, action } = req.body;

    // Kiểm tra quyền đã tồn tại
    const existingPermission = await Permission.findOne({ 
      where: { name, module, action } 
    });
    if (existingPermission) {
      return res.status(400).json({ error: 'Quyền đã tồn tại' });
    }

    const permission = await Permission.create({
      name,
      description,
      module,
      action
    });

    // Log hoạt động
    await UserActivityLog.create({
      userId: req.user.id,
      action: 'create',
      module: 'permission',
      resourceId: permission.id,
      resourceType: 'Permission',
      details: { permissionName: name, module, action },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json(permission);
  } catch (error) {
    console.error('Lỗi khi tạo quyền:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Lấy danh sách nhóm người dùng
const getUserGroups = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const where = search ? {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    const groups = await UserGroup.findAndCountAll({
      where,
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'members',
          through: { attributes: [] },
          attributes: ['id', 'username', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [['name', 'ASC']]
    });

    res.json({
      groups: groups.rows,
      total: groups.count,
      page: parseInt(page),
      totalPages: Math.ceil(groups.count / limit)
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhóm:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Tạo nhóm người dùng mới
const createUserGroup = async (req, res) => {
  try {
    const { name, description, maxMembers, settings, roles } = req.body;

    // Kiểm tra nhóm đã tồn tại
    const existingGroup = await UserGroup.findOne({ where: { name } });
    if (existingGroup) {
      return res.status(400).json({ error: 'Nhóm đã tồn tại' });
    }

    const group = await UserGroup.create({
      name,
      description,
      maxMembers,
      settings,
      isSystem: false
    });

    // Gán vai trò cho nhóm
    if (roles && roles.length > 0) {
      const roleInstances = await Role.findAll({
        where: { id: { [Op.in]: roles } }
      });
      await group.setRoles(roleInstances);
    }

    // Log hoạt động
    await UserActivityLog.create({
      userId: req.user.id,
      action: 'create',
      module: 'user_group',
      resourceId: group.id,
      resourceType: 'UserGroup',
      details: { groupName: name, roles },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('Lỗi khi tạo nhóm:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Cập nhật nhóm người dùng
const updateUserGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, maxMembers, settings, roles, isActive } = req.body;

    const group = await UserGroup.findByPk(id);
    if (!group) {
      return res.status(404).json({ error: 'Nhóm không tồn tại' });
    }

    // Không cho phép cập nhật nhóm hệ thống
    if (group.isSystem) {
      return res.status(403).json({ error: 'Không thể cập nhật nhóm hệ thống' });
    }

    await group.update({
      name,
      description,
      maxMembers,
      settings,
      isActive
    });

    // Cập nhật vai trò
    if (roles) {
      const roleInstances = await Role.findAll({
        where: { id: { [Op.in]: roles } }
      });
      await group.setRoles(roleInstances);
    }

    // Log hoạt động
    await UserActivityLog.create({
      userId: req.user.id,
      action: 'update',
      module: 'user_group',
      resourceId: group.id,
      resourceType: 'UserGroup',
      details: { groupName: name, roles },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(group);
  } catch (error) {
    console.error('Lỗi khi cập nhật nhóm:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

// Xóa nhóm người dùng
const deleteUserGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const group = await UserGroup.findByPk(id);
    if (!group) {
      return res.status(404).json({ error: 'Nhóm không tồn tại' });
    }

    // Không cho phép xóa nhóm hệ thống
    if (group.isSystem) {
      return res.status(403).json({ error: 'Không thể xóa nhóm hệ thống' });
    }

    // Kiểm tra xem có thành viên nào trong nhóm không
    const memberCount = await group.countMembers();
    if (memberCount > 0) {
      return res.status(400).json({ 
        error: `Không thể xóa nhóm. Có ${memberCount} thành viên trong nhóm này.` 
      });
    }

    // Log hoạt động trước khi xóa
    await UserActivityLog.create({
      userId: req.user.id,
      action: 'delete',
      module: 'user_group',
      resourceId: group.id,
      resourceType: 'UserGroup',
      details: { groupName: group.name },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await group.destroy();
    res.json({ message: 'Xóa nhóm thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa nhóm:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

module.exports = {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  createPermission,
  getUserGroups,
  createUserGroup,
  updateUserGroup,
  deleteUserGroup
}; 