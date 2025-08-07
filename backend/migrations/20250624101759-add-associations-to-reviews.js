'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // The 'userId' and 'accommodationId' columns already exist from the initial migration.
    // This migration only needs to add the new 'landlordId' column.
    // We allow null temporarily to handle existing rows in the table.
    // The application logic should ensure this is populated for all new reviews.
    await queryInterface.addColumn('Reviews', 'landlordId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Set to true to avoid constraint errors on existing data
      references: { model: 'Users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Set to NULL if landlord is deleted, not the whole review
      comment: 'The landlord who is being reviewed'
    });
  },
  down: async (queryInterface, Sequelize) => {
    // Only remove the column that this migration adds.
    await queryInterface.removeColumn('Reviews', 'landlordId');
  }
};
