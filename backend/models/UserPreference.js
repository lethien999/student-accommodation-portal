module.exports = (sequelize, DataTypes) => {
  const UserPreference = sequelize.define('UserPreference', {
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
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Danh mục tùy chọn (notification, privacy, display, etc.)'
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Khóa tùy chọn'
    },
    value: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Giá trị tùy chọn (có thể là string, boolean, object, array)'
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Mô tả tùy chọn'
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Tùy chọn hệ thống không thể xóa'
    }
  }, {
    tableName: 'user_preferences',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'category', 'key']
      },
      {
        fields: ['userId']
      },
      {
        fields: ['category']
      }
    ]
  });

  UserPreference.associate = (models) => {
    UserPreference.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return UserPreference;
}; 