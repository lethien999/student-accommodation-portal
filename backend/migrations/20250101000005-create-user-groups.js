'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_groups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isSystem: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Nhóm hệ thống không thể xóa'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      maxMembers: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Số lượng thành viên tối đa (null = không giới hạn)'
      },
      settings: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Cài đặt nhóm (privacy, permissions, etc.)'
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
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_groups');
  }
}; 