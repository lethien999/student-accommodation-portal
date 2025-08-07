module.exports = (sequelize, DataTypes) => {
  const Advertisement = sequelize.define('Advertisement', {
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
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    targetUrl: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isUrl: true
      }
    },
    position: {
      type: DataTypes.ENUM('header', 'sidebar', 'homepage', 'search_results', 'detail_page', 'footer'),
      allowNull: false,
      defaultValue: 'homepage'
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    impressions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    clicks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    ctr: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.0000
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'active', 'paused', 'completed', 'rejected', 'archived'),
      defaultValue: 'draft'
    },
    isScheduled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    scheduleType: {
      type: DataTypes.ENUM('immediate', 'scheduled', 'recurring'),
      defaultValue: 'immediate'
    },
    recurringPattern: {
      type: DataTypes.JSON,
      allowNull: true
    },
    targetAudience: {
      type: DataTypes.JSON,
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    approvedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'advertisements',
    timestamps: true,
    hooks: {
      beforeSave: async (advertisement) => {
        // Calculate CTR
        if (advertisement.impressions > 0) {
          advertisement.ctr = (advertisement.clicks / advertisement.impressions) * 100;
        }
      }
    }
  });
  return Advertisement;
};