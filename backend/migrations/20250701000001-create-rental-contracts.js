'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('rental_contracts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      accommodationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'accommodations', key: 'id' }, onDelete: 'CASCADE' },
      tenantId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      landlordId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      startDate: { type: Sequelize.DATE, allowNull: false },
      endDate: { type: Sequelize.DATE, allowNull: false },
      deposit: { type: Sequelize.DECIMAL(10,2), allowNull: true },
      totalAmount: { type: Sequelize.DECIMAL(10,2), allowNull: true },
      status: { type: Sequelize.ENUM('active','terminated','pending'), defaultValue: 'pending' },
      contractFile: { type: Sequelize.STRING, allowNull: true },
      note: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('rental_contracts');
  }
}; 