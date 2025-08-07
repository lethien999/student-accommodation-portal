'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('amenities', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING, allowNull: false, unique: true },
      icon: { type: Sequelize.STRING, allowNull: true },
      description: { type: Sequelize.STRING, allowNull: true }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('amenities');
  }
}; 