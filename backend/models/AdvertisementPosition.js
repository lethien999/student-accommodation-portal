module.exports = (sequelize, DataTypes) => {
  const AdvertisementPosition = sequelize.define('AdvertisementPosition', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    maxAds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    pricingModel: {
      type: DataTypes.ENUM('cpm', 'cpc', 'flat_rate', 'auction'),
      allowNull: false,
      defaultValue: 'flat_rate'
    },
    targetingOptions: {
      type: DataTypes.JSON,
      allowNull: true
    },
    displayRules: {
      type: DataTypes.JSON,
      allowNull: true
    },
    cssClass: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cssStyle: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    template: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    tableName: 'advertisement_positions',
    timestamps: true
  });
  
  return AdvertisementPosition;
}; 