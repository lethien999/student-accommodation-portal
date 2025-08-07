module.exports = (sequelize, DataTypes) => {
  const AccommodationAmenity = sequelize.define('AccommodationAmenity', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accommodationId: { type: DataTypes.INTEGER, allowNull: false },
    amenityId: { type: DataTypes.INTEGER, allowNull: false }
  }, {
    tableName: 'accommodation_amenities',
    timestamps: false
  });
  return AccommodationAmenity;
}; 