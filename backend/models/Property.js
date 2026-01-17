/**
 * Property Model
 * 
 * Represents a property (nhà trọ) that can contain multiple accommodations (rooms).
 * Allows landlords to manage multiple properties with different addresses.
 * 
 * Follows Single Responsibility Principle - only handles property data.
 * 
 * @module models/Property
 */
module.exports = (sequelize, DataTypes) => {
    const Property = sequelize.define('Property', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Property name (e.g. "Nhà trọ Bình Minh")'
        },
        address: {
            type: DataTypes.STRING(500),
            allowNull: false,
            comment: 'Full address of the property'
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        district: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Quận/Huyện'
        },
        ward: {
            type: DataTypes.STRING(100),
            allowNull: true,
            comment: 'Phường/Xã'
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'General description of the property'
        },
        images: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
            comment: 'Array of image URLs'
        },
        // Utility pricing per property
        electricityPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 3500,
            comment: 'Electricity price per kWh (VND)'
        },
        waterPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 15000,
            comment: 'Water price per m3 (VND)'
        },
        internetPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 0,
            comment: 'Monthly internet fee (VND)'
        },
        garbagePrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            defaultValue: 20000,
            comment: 'Monthly garbage collection fee (VND)'
        },
        // Billing settings
        billingDay: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
            comment: 'Day of month when rent is due (1-28)'
        },
        // Statistics cache
        totalRooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Total number of rooms'
        },
        occupiedRooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: 'Number of occupied rooms'
        },
        // Status
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
            allowNull: false,
            defaultValue: 'active'
        }
    }, {
        tableName: 'properties',
        timestamps: true,
        indexes: [
            { fields: ['landlordId'] },
            { fields: ['city'] },
            { fields: ['status'] }
        ]
    });

    Property.associate = function (models) {
        // Belongs to landlord
        Property.belongsTo(models.User, {
            foreignKey: 'landlordId',
            as: 'landlord'
        });

        // Has many accommodations (rooms)
        Property.hasMany(models.Accommodation, {
            foreignKey: 'propertyId',
            as: 'accommodations'
        });
    };

    // Instance method to update room counts
    Property.prototype.updateRoomCounts = async function () {
        const accommodations = await this.getAccommodations();
        this.totalRooms = accommodations.length;
        this.occupiedRooms = accommodations.filter(a => a.status === 'rented').length;
        await this.save();
    };

    return Property;
};
