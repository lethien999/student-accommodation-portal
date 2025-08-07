'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Kiểm tra cột roomType_new đã tồn tại chưa
    const table = await queryInterface.describeTable('Accommodations');
    if (!table.roomType_new) {
      await queryInterface.addColumn('Accommodations', 'roomType_new', {
        type: Sequelize.JSON,
        allowNull: true,
      });
    }
    // Chỉ xóa cột roomType nếu đã tồn tại
    if (table.roomType) {
      await queryInterface.removeColumn('Accommodations', 'roomType');
    }
    // Đổi tên nếu roomType_new tồn tại và roomType chưa tồn tại
    const tableAfter = await queryInterface.describeTable('Accommodations');
    if (tableAfter.roomType_new && !tableAfter.roomType) {
      await queryInterface.renameColumn('Accommodations', 'roomType_new', 'roomType');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Đổi lại về STRING nếu cần rollback
    await queryInterface.changeColumn('Accommodations', 'roomType', {
        type: Sequelize.STRING,
        allowNull: true,
    });
  }
};
