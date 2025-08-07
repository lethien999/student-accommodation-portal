module.exports = (sequelize, DataTypes) => {
  const Accommodation = sequelize.define('Accommodation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true
    },
    roomType: {
      type: DataTypes.JSON,
      get() {
        const value = this.getDataValue('roomType');
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            return [value];
          }
        }
        return Array.isArray(value) ? value : [];
      },
      set(value) {
        if (Array.isArray(value)) {
          this.setDataValue('roomType', value);
        } else if (typeof value === 'string' && value.trim() !== '') {
          this.setDataValue('roomType', [value]);
        } else {
          this.setDataValue('roomType', []);
        }
      }
    },
    status: {
      type: DataTypes.ENUM('available', 'rented', 'pending', 'unavailable', 'under_maintenance'),
      defaultValue: 'available'
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Required deposit amount'
    },
    depositStatus: {
      type: DataTypes.ENUM('not_required', 'pending', 'paid', 'refunded'),
      defaultValue: 'not_required'
    },
    depositDueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    averageRating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false,
      defaultValue: 0.0
    },
    numberOfReviews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'accommodations',
  });

  Accommodation.associate = function(models) {
    Accommodation.belongsTo(models.User, {
      foreignKey: 'landlordId',
      as: 'landlord'
    });
    Accommodation.hasMany(models.Review, {
      foreignKey: 'accommodationId',
      as: 'reviews'
    });
    Accommodation.hasMany(models.Event, {
      foreignKey: 'accommodationId',
      as: 'events'
    });
    Accommodation.hasMany(models.MaintenanceRequest, {
      foreignKey: 'accommodationId',
      as: 'maintenanceRequests'
    });
    // Add other associations if needed, e.g., with Amenities
  };

  return Accommodation;
}; 