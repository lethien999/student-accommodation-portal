'use strict';
module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define('Review', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    moderatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    moderatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    moderationReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    landlordId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    accommodationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    tableName: 'reviews',
    timestamps: true
  });

  Review.associate = function(models) {
    // The user who wrote the review
    Review.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    // The landlord who was reviewed
    Review.belongsTo(models.User, {
      foreignKey: 'landlordId',
      as: 'landlord'
    });
    // The accommodation that was reviewed
    Review.belongsTo(models.Accommodation, {
      foreignKey: 'accommodationId',
      as: 'accommodation'
    });
    // The moderator who processed the review
    Review.belongsTo(models.User, {
      foreignKey: 'moderatedBy',
      as: 'moderator'
    });
  };

  return Review;
}; 