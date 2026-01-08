const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Accommodation = require('./Accommodation');

const SavedAccommodation = sequelize.define('SavedAccommodation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
    tableName: 'SavedAccommodations',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'accommodationId']
        }
    ]
});

// Associations
User.hasMany(SavedAccommodation, { foreignKey: 'userId', as: 'savedAccommodations' });
SavedAccommodation.belongsTo(User, { foreignKey: 'userId' });

Accommodation.hasMany(SavedAccommodation, { foreignKey: 'accommodationId', as: 'savedByUsers' });
SavedAccommodation.belongsTo(Accommodation, { foreignKey: 'accommodationId' });

module.exports = SavedAccommodation;
