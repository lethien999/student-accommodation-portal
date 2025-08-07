'use strict';
const EVENT_TYPES = ['maintenance', 'community', 'viewing', 'other'];

module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define('Event', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM(...EVENT_TYPES),
      allowNull: false
    },
    start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    end: {
      type: DataTypes.DATE,
      allowNull: false
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active'
    },
    accommodationId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    timestamps: true
  });
  Event.associate = models => {
    Event.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Event.belongsTo(models.Accommodation, { foreignKey: 'accommodationId', as: 'accommodation' });
  };
  return Event;
}; 