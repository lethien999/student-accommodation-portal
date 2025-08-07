const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('email', 'sms', 'push', 'in_app'),
    allowNull: false,
    defaultValue: 'email'
  },
  recipients: {
    type: DataTypes.ENUM('all', 'tenants', 'landlords', 'admins', 'custom'),
    allowNull: false,
    defaultValue: 'all'
  },
  customRecipients: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'JSON array of user IDs for custom recipients'
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'sent', 'failed'),
    allowNull: false,
    defaultValue: 'draft'
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sentCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  openedCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  failedCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  repeat: {
    type: DataTypes.ENUM('once', 'daily', 'weekly', 'monthly'),
    allowNull: false,
    defaultValue: 'once'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    {
      fields: ['status']
    },
    {
      fields: ['type']
    },
    {
      fields: ['scheduledAt']
    },
    {
      fields: ['createdBy']
    }
  ]
});

module.exports = Notification; 