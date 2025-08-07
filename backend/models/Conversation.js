'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      Conversation.belongsTo(models.User, {
        foreignKey: 'user1Id',
        as: 'user1',
      });
      Conversation.belongsTo(models.User, {
        foreignKey: 'user2Id',
        as: 'user2',
      });
      Conversation.hasMany(models.Message, {
        foreignKey: 'conversationId',
        as: 'messages',
      });
      Conversation.belongsTo(models.Message, {
        foreignKey: 'lastMessageId',
        as: 'lastMessage',
      });
    }
  }
  Conversation.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user1Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      user2Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      lastMessageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Messages',
          key: 'id',
        },
      },
    },
    {
      sequelize,
      modelName: 'Conversation',
    }
  );
  return Conversation;
}; 