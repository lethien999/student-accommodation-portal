const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Accommodation = sequelize.define('Accommodation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 100]
    }
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  amenities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  rules: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  services: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  detailInfo: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {
      general: {},
      features: {}
    }
  },
  rooms: {
    type: DataTypes.JSON, // List of {name, price, area, status}
    allowNull: true,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('available', 'rented', 'maintenance'),
    defaultValue: 'available'
  },
  verifyStatus: {
    type: DataTypes.ENUM('none', 'pending', 'verified', 'rejected'),
    defaultValue: 'none'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  createdAt: true,
  updatedAt: true
});

// Define association
Accommodation.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

module.exports = Accommodation; 