module.exports = (sequelize, DataTypes) => {
  const AdvertisementStats = sequelize.define('AdvertisementStats', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    advertisementId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
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
    uniqueImpressions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    uniqueClicks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    ctr: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      defaultValue: 0.0000
    },
    revenue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    roi: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    deviceType: {
      type: DataTypes.ENUM('desktop', 'mobile', 'tablet', 'unknown'),
      allowNull: true
    },
    browser: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    referrer: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sessionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'advertisement_stats',
    timestamps: true,
    indexes: [
      { fields: ['advertisementId', 'date'] },
      { fields: ['date'] },
      { fields: ['advertisementId'] }
    ],
    hooks: {
      beforeSave: async (stats) => {
        // Calculate CTR
        if (stats.impressions > 0) {
          stats.ctr = (stats.clicks / stats.impressions) * 100;
        }
        // Calculate ROI
        if (stats.cost > 0) {
          stats.roi = ((stats.revenue - stats.cost) / stats.cost) * 100;
        }
      }
    }
  });
  return AdvertisementStats;
}; 