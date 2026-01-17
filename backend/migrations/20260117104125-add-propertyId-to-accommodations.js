'use strict';

/**
 * Migration: Add propertyId to Accommodations
 * 
 * Adds propertyId foreign key to accommodations table
 * to link rooms to their parent property.
 */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Add propertyId column
        await queryInterface.addColumn('accommodations', 'propertyId', {
            type: Sequelize.INTEGER,
            allowNull: true, // Allow null for existing accommodations
            references: {
                model: 'properties',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        });

        // Add index for propertyId
        await queryInterface.addIndex('accommodations', ['propertyId']);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('accommodations', 'propertyId');
    }
};
