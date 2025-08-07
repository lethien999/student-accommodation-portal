'use strict';
const PRIORITY_LEVELS = ['Low', 'Medium', 'High'];
const STATUS_TYPES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];

module.exports = (sequelize, DataTypes) => {
  const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM(...PRIORITY_LEVELS),
      allowNull: false,
      defaultValue: 'Medium'
    },
    status: {
      type: DataTypes.ENUM(...STATUS_TYPES),
      allowNull: false,
      defaultValue: 'Pending'
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true
    },
    tenantId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    landlordId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    accommodationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'MaintenanceRequests'
  });

  MaintenanceRequest.associate = function(models) {
    // Association to the user who created the request (tenant)
    MaintenanceRequest.belongsTo(models.User, {
      foreignKey: 'tenantId',
      as: 'tenant'
    });
    // Association to the user who owns the property (landlord)
    MaintenanceRequest.belongsTo(models.User, {
      foreignKey: 'landlordId',
      as: 'landlord'
    });
    // Association to the property
    MaintenanceRequest.belongsTo(models.Accommodation, {
      foreignKey: 'accommodationId',
      as: 'accommodation'
    });
  };

  return MaintenanceRequest;
};