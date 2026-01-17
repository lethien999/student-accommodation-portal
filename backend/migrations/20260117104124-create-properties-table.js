'use strict';

/**
 * Migration: Create Properties Table
 * 
 * Creates the properties table for multi-property management.
 * Allows landlords to group accommodations (rooms) under properties.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('properties', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            address: {
                type: Sequelize.STRING(500),
                allowNull: false
            },
            city: {
                type: Sequelize.STRING(100),
                allowNull: false
            },
            district: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            ward: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            latitude: {
                type: Sequelize.DECIMAL(10, 8),
                allowNull: true
            },
            longitude: {
                type: Sequelize.DECIMAL(11, 8),
                allowNull: true
            },
            description: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            images: {
                type: Sequelize.JSON,
                allowNull: true,
                defaultValue: []
            },
            electricityPrice: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 3500
            },
            waterPrice: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 15000
            },
            internetPrice: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0
            },
            garbagePrice: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 20000
            },
            billingDay: {
                type: Sequelize.INTEGER,
                allowNull: true,
                defaultValue: 1
            },
            totalRooms: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            occupiedRooms: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive', 'maintenance'),
                allowNull: false,
                defaultValue: 'active'
            },
            landlordId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW
            }
        });

        // Add indexes
        await queryInterface.addIndex('properties', ['landlordId']);
        await queryInterface.addIndex('properties', ['city']);
        await queryInterface.addIndex('properties', ['status']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('properties');
    }
};
