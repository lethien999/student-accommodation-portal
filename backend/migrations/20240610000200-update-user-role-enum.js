'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Đổi tất cả user role 'student' về 'tenant' trước khi đổi ENUM
    await queryInterface.sequelize.query(`UPDATE users SET role = 'tenant' WHERE role = 'student' OR role NOT IN ('admin', 'landlord', 'tenant', 'moderator');`);
    // Đổi ENUM role
    await queryInterface.sequelize.query(`
      ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'landlord', 'tenant', 'moderator') NOT NULL DEFAULT 'tenant';
    `);
  },
  down: async (queryInterface, Sequelize) => {
    // Không rollback về student nữa
  }
}; 