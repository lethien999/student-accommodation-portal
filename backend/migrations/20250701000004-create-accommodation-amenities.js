'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('accommodation_amenities', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      accommodationId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'accommodations', key: 'id' }, onDelete: 'CASCADE' },
      amenityId: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'amenities', key: 'id' }, onDelete: 'CASCADE' }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('accommodation_amenities');
  }
}; 