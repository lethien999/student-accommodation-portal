module.exports = (sequelize, DataTypes) => {
  const UserGroup = sequelize.define('UserGroup', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Nhóm hệ thống không thể xóa'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    maxMembers: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Số lượng thành viên tối đa (null = không giới hạn)'
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Cài đặt nhóm (privacy, permissions, etc.)'
    }
  }, {
    tableName: 'user_groups',
    timestamps: true
  });

  UserGroup.associate = (models) => {
    UserGroup.belongsToMany(models.User, {
      through: 'UserGroupMembers',
      foreignKey: 'groupId',
      as: 'members'
    });
    
    UserGroup.belongsToMany(models.Role, {
      through: 'GroupRoles',
      foreignKey: 'groupId',
      as: 'roles'
    });
  };

  return UserGroup;
}; 