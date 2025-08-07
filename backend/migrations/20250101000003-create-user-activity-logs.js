'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_activity_logs', {
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
      action: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Hành động được thực hiện (login, logout, create, update, delete, etc.)'
      },
      module: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Module liên quan (user, accommodation, advertisement, etc.)'
      },
      resourceId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID của resource được thao tác'
      },
      resourceType: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Loại resource (User, Accommodation, Advertisement, etc.)'
      },
      details: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Chi tiết bổ sung về hành động'
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('success', 'failed', 'pending'),
        defaultValue: 'success'
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Tạo indexes
    await queryInterface.addIndex('user_activity_logs', ['userId']);
    await queryInterface.addIndex('user_activity_logs', ['action']);
    await queryInterface.addIndex('user_activity_logs', ['module']);
    await queryInterface.addIndex('user_activity_logs', ['createdAt']);
    await queryInterface.addIndex('user_activity_logs', ['userId', 'createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_activity_logs');
  }
}; 