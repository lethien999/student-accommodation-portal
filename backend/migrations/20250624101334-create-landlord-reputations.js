'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LandlordReputations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true, // Each user (landlord) has only one reputation record
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      reputationScore: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      responseTime: {
        type: Sequelize.INTEGER,
        allowNull: true, // in hours
        comment: 'Average message response time in hours'
      },
      reviewRating: {
        type: Sequelize.FLOAT,
        allowNull: true,
        comment: 'Average rating from reviews'
      },
      verifiedListings: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      disputeRate: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
        comment: 'Percentage of rentals that resulted in a dispute'
      },
      lastCalculated: {
        type: Sequelize.DATE,
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('LandlordReputations');
  }
};
