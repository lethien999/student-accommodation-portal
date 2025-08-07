'use strict';
module.exports = (sequelize, DataTypes) => {
  const LoyaltyPoint = sequelize.define('LoyaltyPoint', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('earn', 'redeem'),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    relatedPaymentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    timestamps: true,
  });

  LoyaltyPoint.associate = function(models) {
    LoyaltyPoint.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    LoyaltyPoint.belongsTo(models.Payment, {
      foreignKey: 'relatedPaymentId',
      as: 'payment'
    });
  };

  return LoyaltyPoint;
}; 