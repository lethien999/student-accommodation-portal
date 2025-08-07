'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Messages', 'conversationId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Conversations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await queryInterface.removeColumn('Messages', 'receiverId');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('Messages', 'receiverId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    });
    await queryInterface.removeColumn('Messages', 'conversationId');
  }
};
