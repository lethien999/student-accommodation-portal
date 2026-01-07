const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Accommodation = require('./Accommodation');

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
    timestamps: true
});

// Associations
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Accommodation.hasMany(Review, { foreignKey: 'accommodationId', as: 'reviews' });
Review.belongsTo(Accommodation, { foreignKey: 'accommodationId', as: 'accommodation' });

module.exports = Review;
