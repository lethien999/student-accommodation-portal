'use strict';
module.exports = (sequelize, DataTypes) => {
  const LandlordReputation = sequelize.define('LandlordReputation', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    reputationScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    responseTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    reviewRating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    verifiedListings: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    disputeRate: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
    },
    lastCalculated: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: true,
  });
  
  LandlordReputation.associate = models => {
    LandlordReputation.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return LandlordReputation;
}; 