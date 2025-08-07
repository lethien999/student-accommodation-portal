'use strict';
module.exports = (sequelize, DataTypes) => {
  const NotificationSubscription = sequelize.define('NotificationSubscription', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    token: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'notification_subscriptions',
    timestamps: true
  });

  NotificationSubscription.associate = function(models) {
    NotificationSubscription.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return NotificationSubscription;
}; 