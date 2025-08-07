'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_preferences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      category: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Danh mục tùy chọn (notification, privacy, display, etc.)'
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Khóa tùy chọn'
      },
      value: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Giá trị tùy chọn (có thể là string, boolean, object, array)'
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Mô tả tùy chọn'
      },
      isSystem: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Tùy chọn hệ thống không thể xóa'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Tạo unique index cho userId, category, key
    await queryInterface.addIndex('user_preferences', ['userId', 'category', 'key'], {
      unique: true
    });
    
    // Tạo các index khác
    await queryInterface.addIndex('user_preferences', ['userId']);
    await queryInterface.addIndex('user_preferences', ['category']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_preferences');
  }
}; 