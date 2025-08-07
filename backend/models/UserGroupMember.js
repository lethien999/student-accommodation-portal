module.exports = (sequelize, DataTypes) => {
  const UserGroupMember = sequelize.define('UserGroupMember', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'user_groups',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('member', 'moderator', 'admin'),
      defaultValue: 'member',
      comment: 'Vai trò trong nhóm'
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    permissions: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Quyền đặc biệt trong nhóm'
    }
  }, {
    tableName: 'user_group_members',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'groupId']
      },
      {
        fields: ['groupId']
      },
      {
        fields: ['userId']
      }
    ]
  });

  UserGroupMember.associate = (models) => {
    UserGroupMember.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    UserGroupMember.belongsTo(models.UserGroup, {
      foreignKey: 'groupId',
      as: 'group'
    });
  };

  return UserGroupMember;
}; 