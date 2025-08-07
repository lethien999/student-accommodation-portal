'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_group_members', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      role: {
        type: Sequelize.ENUM('member', 'moderator', 'admin'),
        defaultValue: 'member',
        comment: 'Vai trò trong nhóm'
      },
      joinedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      permissions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Quyền đặc biệt trong nhóm'
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

    // Tạo unique index cho userId, groupId
    await queryInterface.addIndex('user_group_members', ['userId', 'groupId'], {
      unique: true
    });
    
    // Tạo các index khác
    await queryInterface.addIndex('user_group_members', ['groupId']);
    await queryInterface.addIndex('user_group_members', ['userId']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_group_members');
  }
}; 