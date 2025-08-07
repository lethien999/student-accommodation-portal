'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('accommodations', 'status', {
      type: Sequelize.ENUM('available', 'rented', 'pending', 'unavailable', 'under_maintenance'),
      defaultValue: 'available'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('accommodations', 'status', {
      type: Sequelize.ENUM('available', 'rented', 'pending', 'unavailable', 'under_maintenance'),
      defaultValue: 'available'
    });
  }
}; 