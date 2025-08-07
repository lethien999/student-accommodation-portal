'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('email', 'sms', 'push', 'in_app'),
        allowNull: false,
        defaultValue: 'email'
      },
      recipients: {
        type: Sequelize.ENUM('all', 'tenants', 'landlords', 'admins', 'custom'),
        allowNull: false,
        defaultValue: 'all'
      },
      customRecipients: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'JSON array of user IDs for custom recipients'
      },
      status: {
        type: Sequelize.ENUM('draft', 'scheduled', 'sent', 'failed'),
        allowNull: false,
        defaultValue: 'draft'
      },
      scheduledAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      sentAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      sentCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      openedCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      failedCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      repeat: {
        type: Sequelize.ENUM('once', 'daily', 'weekly', 'monthly'),
        allowNull: false,
        defaultValue: 'once'
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Add indexes
    await queryInterface.addIndex('notifications', ['status']);
    await queryInterface.addIndex('notifications', ['type']);
    await queryInterface.addIndex('notifications', ['scheduledAt']);
    await queryInterface.addIndex('notifications', ['createdBy']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notifications');
  }
}; 