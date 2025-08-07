'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('reviews', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    });

    await queryInterface.addColumn('reviews', 'moderatedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('reviews', 'moderatedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('reviews', 'moderationReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Add indexes for better performance
    await queryInterface.addIndex('reviews', ['status']);
    await queryInterface.addIndex('reviews', ['moderatedBy']);
    await queryInterface.addIndex('reviews', ['moderatedAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('reviews', ['status']);
    await queryInterface.removeIndex('reviews', ['moderatedBy']);
    await queryInterface.removeIndex('reviews', ['moderatedAt']);

    await queryInterface.removeColumn('reviews', 'moderationReason');
    await queryInterface.removeColumn('reviews', 'moderatedAt');
    await queryInterface.removeColumn('reviews', 'moderatedBy');
    await queryInterface.removeColumn('reviews', 'status');

    // Remove the ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_reviews_status";');
  }
}; 