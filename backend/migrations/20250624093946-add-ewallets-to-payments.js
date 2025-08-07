'use strict';

const TABLE_NAME = 'payments';
const COLUMN_NAME = 'paymentMethod';
const NEW_ENUM_VALUES = ['credit_card', 'bank_transfer', 'cash', 'vnpay', 'momo', 'zalopay', 'applepay', 'googlepay'];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === 'mysql') {
      await queryInterface.changeColumn(TABLE_NAME, COLUMN_NAME, {
        type: Sequelize.ENUM(...NEW_ENUM_VALUES),
        allowNull: false,
      });
    } else {
      // For PostgreSQL, you might need to drop the constraint, alter the type, and re-add the constraint.
      // This is a simplified version. For production, a more robust solution is needed.
      const enumName = `enum_${TABLE_NAME}_${COLUMN_NAME}`;
      await queryInterface.sequelize.query(`ALTER TYPE "${enumName}" ADD VALUE IF NOT EXISTS 'zalopay';`);
      await queryInterface.sequelize.query(`ALTER TYPE "${enumName}" ADD VALUE IF NOT EXISTS 'applepay';`);
      await queryInterface.sequelize.query(`ALTER TYPE "${enumName}" ADD VALUE IF NOT EXISTS 'googlepay';`);
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect === 'mysql') {
        await queryInterface.changeColumn(TABLE_NAME, COLUMN_NAME, {
          type: Sequelize.ENUM('credit_card', 'bank_transfer', 'cash', 'vnpay', 'momo'),
          allowNull: false,
        });
    } else {
      // Reverting added values in PostgreSQL is not straightforward and often avoided.
      // A common strategy is to not have a down migration for ENUM additions.
      console.log('Reverting ENUM additions on PostgreSQL is not supported in this migration.');
    }
  }
};
