const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Accommodation = require('./Accommodation');

const Booking = sequelize.define('Booking', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    type: {
        type: DataTypes.ENUM('viewing', 'rental'),
        defaultValue: 'viewing',
        allowNull: false
    },
    checkInDate: {
        type: DataTypes.DATEONLY, // Used as Viewing Date for 'viewing' type
        allowNull: false
    },
    checkOutDate: {
        type: DataTypes.DATEONLY,
        allowNull: true // Optional for viewing
    },
    numOfPeople: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true // User's contact number
    },
    totalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true // Not needed for viewing requests
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'rejected', 'cancelled', 'completed'),
        defaultValue: 'pending',
        allowNull: false
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    accommodationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Accommodation,
            key: 'id'
        }
    }
}, {
    timestamps: true,
    createdAt: true,
    updatedAt: true
});

// Associations
Booking.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Booking.belongsTo(Accommodation, { foreignKey: 'accommodationId', as: 'accommodation' });

User.hasMany(Booking, { foreignKey: 'userId', as: 'bookings' });
Accommodation.hasMany(Booking, { foreignKey: 'accommodationId', as: 'bookings' });

module.exports = Booking;
