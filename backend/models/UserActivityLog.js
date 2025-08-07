module.exports = (sequelize, DataTypes) => {
  const UserActivityLog = sequelize.define('UserActivityLog', {
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
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Hành động được thực hiện (login, logout, create, update, delete, etc.)'
    },
    module: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Module liên quan (user, accommodation, advertisement, etc.)'
    },
    resourceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID của resource được thao tác'
    },
    resourceType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Loại resource (User, Accommodation, Advertisement, etc.)'
    },
    details: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Chi tiết bổ sung về hành động'
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('success', 'failed', 'pending'),
      defaultValue: 'success'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'user_activity_logs',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['action']
      },
      {
        fields: ['module']
      },
      {
        fields: ['createdAt']
      },
      {
        fields: ['userId', 'createdAt']
      }
    ]
  });

  UserActivityLog.associate = (models) => {
    UserActivityLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return UserActivityLog;
}; 