'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('accommodation_price_histories', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      accommodationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'accommodations', key: 'id' }, onDelete: 'CASCADE' },
      oldPrice: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      newPrice: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      changedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      changedBy: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('accommodation_price_histories');
  }
}; 