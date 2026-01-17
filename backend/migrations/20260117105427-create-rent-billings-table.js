'use strict';

/**
 * Migration: Create Rent Billings Table
 * 
 * Creates the rent_billings table for monthly billing management.
 * Tracks rent, utilities (electricity, water), and payment status.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('rent_billings', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            accommodationId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'accommodations',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            tenantId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
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
            propertyId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'properties',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            contractId: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'rental_contracts',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            billingMonth: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            billingYear: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            billingPeriod: {
                type: Sequelize.STRING(7),
                allowNull: false
            },
            dueDate: {
                type: Sequelize.DATE,
                allowNull: false
            },
            roomRent: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            electricityPreviousReading: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0
            },
            electricityCurrentReading: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0
            },
            electricityUsage: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0
            },
            electricityPrice: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 3500
            },
            electricityAmount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true,
                defaultValue: 0
            },
            waterPreviousReading: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0
            },
            waterCurrentReading: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0
            },
            waterUsage: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 0
            },
            waterPrice: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: true,
                defaultValue: 15000
            },
            waterAmount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true,
                defaultValue: 0
            },
            internetFee: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true,
                defaultValue: 0
            },
            garbageFee: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true,
                defaultValue: 0
            },
            parkingFee: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true,
                defaultValue: 0
            },
            otherFees: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true,
                defaultValue: 0
            },
            otherFeesDescription: {
                type: Sequelize.STRING(500),
                allowNull: true
            },
            discount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true,
                defaultValue: 0
            },
            discountReason: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            subtotal: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            totalAmount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            previousBalance: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: true,
                defaultValue: 0
            },
            grandTotal: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            paidAmount: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            remainingBalance: {
                type: Sequelize.DECIMAL(12, 2),
                allowNull: false,
                defaultValue: 0
            },
            status: {
                type: Sequelize.ENUM('draft', 'pending', 'partial', 'paid', 'overdue', 'cancelled'),
                allowNull: false,
                defaultValue: 'draft'
            },
            paidAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            notificationSent: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            notificationSentAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            reminderCount: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            lastReminderAt: {
                type: Sequelize.DATE,
                allowNull: true
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            isAutoGenerated: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
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
        await queryInterface.addIndex('rent_billings', ['accommodationId']);
        await queryInterface.addIndex('rent_billings', ['tenantId']);
        await queryInterface.addIndex('rent_billings', ['landlordId']);
        await queryInterface.addIndex('rent_billings', ['propertyId']);
        await queryInterface.addIndex('rent_billings', ['billingPeriod']);
        await queryInterface.addIndex('rent_billings', ['status']);
        await queryInterface.addIndex('rent_billings', ['dueDate']);
        await queryInterface.addIndex('rent_billings', ['accommodationId', 'billingPeriod'], {
            unique: true,
            name: 'unique_accommodation_billing_period'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('rent_billings');
    }
};
