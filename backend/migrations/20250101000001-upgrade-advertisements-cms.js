'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new columns to advertisements table
    await queryInterface.addColumn('advertisements', 'position', {
      type: Sequelize.ENUM('header', 'sidebar', 'homepage', 'search_results', 'detail_page', 'footer'),
      allowNull: false,
      defaultValue: 'homepage'
    });

    await queryInterface.addColumn('advertisements', 'priority', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    });

    await queryInterface.addColumn('advertisements', 'ctr', {
      type: Sequelize.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.0000
    });

    await queryInterface.addColumn('advertisements', 'isScheduled', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('advertisements', 'scheduleType', {
      type: Sequelize.ENUM('immediate', 'scheduled', 'recurring'),
      allowNull: false,
      defaultValue: 'immediate'
    });

    await queryInterface.addColumn('advertisements', 'recurringPattern', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('advertisements', 'targetAudience', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('advertisements', 'tags', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('advertisements', 'metadata', {
      type: Sequelize.JSON,
      allowNull: true
    });

    await queryInterface.addColumn('advertisements', 'approvedBy', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('advertisements', 'approvedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('advertisements', 'rejectionReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Update status enum to include new statuses
    await queryInterface.changeColumn('advertisements', 'status', {
      type: Sequelize.ENUM('draft', 'pending', 'active', 'paused', 'completed', 'rejected', 'archived'),
      allowNull: false,
      defaultValue: 'draft'
    });

    // Create advertisement_stats table
    await queryInterface.createTable('advertisement_stats', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      advertisementId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'advertisements',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      impressions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      clicks: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      uniqueImpressions: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      uniqueClicks: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      ctr: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 0.0000
      },
      revenue: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      cost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      roi: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      deviceType: {
        type: Sequelize.ENUM('desktop', 'mobile', 'tablet', 'unknown'),
        allowNull: true
      },
      browser: {
        type: Sequelize.STRING,
        allowNull: true
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      referrer: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sessionId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes for advertisement_stats
    await queryInterface.addIndex('advertisement_stats', ['advertisementId', 'date']);
    await queryInterface.addIndex('advertisement_stats', ['date']);
    await queryInterface.addIndex('advertisement_stats', ['advertisementId']);

    // Create advertisement_positions table
    await queryInterface.createTable('advertisement_positions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      width: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      height: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      maxAds: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      pricingModel: {
        type: Sequelize.ENUM('cpm', 'cpc', 'flat_rate', 'auction'),
        allowNull: false,
        defaultValue: 'flat_rate'
      },
      targetingOptions: {
        type: Sequelize.JSON,
        allowNull: true
      },
      displayRules: {
        type: Sequelize.JSON,
        allowNull: true
      },
      cssClass: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cssStyle: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      template: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Insert default advertisement positions
    await queryInterface.bulkInsert('advertisement_positions', [
      {
        name: 'Homepage Banner',
        code: 'homepage',
        description: 'Main banner on homepage',
        width: 728,
        height: 90,
        maxAds: 3,
        price: 50.00,
        pricingModel: 'flat_rate',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Sidebar Advertisement',
        code: 'sidebar',
        description: 'Sidebar advertisement',
        width: 300,
        height: 250,
        maxAds: 2,
        price: 30.00,
        pricingModel: 'flat_rate',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Search Results',
        code: 'search_results',
        description: 'Advertisement in search results',
        width: 728,
        height: 90,
        maxAds: 1,
        price: 40.00,
        pricingModel: 'flat_rate',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Detail Page',
        code: 'detail_page',
        description: 'Advertisement on accommodation detail page',
        width: 728,
        height: 90,
        maxAds: 2,
        price: 35.00,
        pricingModel: 'flat_rate',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Header Banner',
        code: 'header',
        description: 'Header banner',
        width: 728,
        height: 90,
        maxAds: 1,
        price: 60.00,
        pricingModel: 'flat_rate',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Footer Banner',
        code: 'footer',
        description: 'Footer banner',
        width: 728,
        height: 90,
        maxAds: 1,
        price: 25.00,
        pricingModel: 'flat_rate',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove new columns from advertisements table
    await queryInterface.removeColumn('advertisements', 'position');
    await queryInterface.removeColumn('advertisements', 'priority');
    await queryInterface.removeColumn('advertisements', 'ctr');
    await queryInterface.removeColumn('advertisements', 'isScheduled');
    await queryInterface.removeColumn('advertisements', 'scheduleType');
    await queryInterface.removeColumn('advertisements', 'recurringPattern');
    await queryInterface.removeColumn('advertisements', 'targetAudience');
    await queryInterface.removeColumn('advertisements', 'tags');
    await queryInterface.removeColumn('advertisements', 'metadata');
    await queryInterface.removeColumn('advertisements', 'approvedBy');
    await queryInterface.removeColumn('advertisements', 'approvedAt');
    await queryInterface.removeColumn('advertisements', 'rejectionReason');

    // Revert status enum
    await queryInterface.changeColumn('advertisements', 'status', {
      type: Sequelize.ENUM('active', 'paused', 'completed', 'pending', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    });

    // Drop tables
    await queryInterface.dropTable('advertisement_stats');
    await queryInterface.dropTable('advertisement_positions');
  }
}; 