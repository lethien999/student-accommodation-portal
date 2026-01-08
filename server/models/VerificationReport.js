const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Accommodation = require('./Accommodation');
const User = require('./User'); // Staff or Admin

const VerificationReport = sequelize.define('VerificationReport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    accommodationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    staffId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    criteria: {
        type: DataTypes.JSON,
        defaultValue: {
            realImages: false,
            safeLocation: false,
            correctPrice: false,
            amenitiesMatch: false
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    adminId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    adminComment: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'VerificationReports',
    timestamps: true
});

// Associations
Accommodation.hasMany(VerificationReport, { foreignKey: 'accommodationId', as: 'verificationReports' });
VerificationReport.belongsTo(Accommodation, { foreignKey: 'accommodationId' });

User.hasMany(VerificationReport, { foreignKey: 'staffId', as: 'submittedReports' });
VerificationReport.belongsTo(User, { foreignKey: 'staffId', as: 'staff' });

User.hasMany(VerificationReport, { foreignKey: 'adminId', as: 'reviewedReports' });
VerificationReport.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });

module.exports = VerificationReport;
