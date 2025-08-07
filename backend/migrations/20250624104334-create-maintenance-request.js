'use strict';
const PRIORITY_LEVELS = ['Low', 'Medium', 'High'];
const STATUS_TYPES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('MaintenanceRequests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM(...PRIORITY_LEVELS),
        allowNull: false,
        defaultValue: 'Medium'
      },
      status: {
        type: Sequelize.ENUM(...STATUS_TYPES),
        allowNull: false,
        defaultValue: 'Pending'
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true
      },
      tenantId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      landlordId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      accommodationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Accommodations', key: 'id' },
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
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('MaintenanceRequests');
  }
};