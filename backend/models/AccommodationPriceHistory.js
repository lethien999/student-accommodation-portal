module.exports = (sequelize, DataTypes) => {
  const AccommodationPriceHistory = sequelize.define('AccommodationPriceHistory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accommodationId: { type: DataTypes.INTEGER, allowNull: false },
    oldPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    newPrice: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    changedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    changedBy: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'accommodation_price_histories',
    timestamps: false
  });
  return AccommodationPriceHistory;
}; 