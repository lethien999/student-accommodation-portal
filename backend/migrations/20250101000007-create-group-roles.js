'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('group_roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user_groups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Vai trò mặc định cho nhóm'
      },
      permissions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Quyền đặc biệt cho vai trò trong nhóm này'
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

    // Tạo unique index cho groupId, roleId
    await queryInterface.addIndex('group_roles', ['groupId', 'roleId'], {
      unique: true
    });
    
    // Tạo các index khác
    await queryInterface.addIndex('group_roles', ['groupId']);
    await queryInterface.addIndex('group_roles', ['roleId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('group_roles');
  }
}; 