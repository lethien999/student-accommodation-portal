module.exports = (sequelize, DataTypes) => {
  const GroupRole = sequelize.define('GroupRole', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user_groups',
        key: 'id'
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Vai trò mặc định cho nhóm'
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Quyền đặc biệt cho vai trò trong nhóm này'
    }
  }, {
    tableName: 'group_roles',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['groupId', 'roleId']
      },
      {
        fields: ['groupId']
      },
      {
        fields: ['roleId']
      }
    ]
  });

  GroupRole.associate = (models) => {
    GroupRole.belongsTo(models.UserGroup, {
      foreignKey: 'groupId',
      as: 'group'
    });
    
    GroupRole.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'role'
    });
  };

  return GroupRole;
}; 