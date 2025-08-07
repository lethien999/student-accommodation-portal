module.exports = (sequelize, DataTypes) => {
  const Amenity = sequelize.define('Amenity', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    icon: { type: DataTypes.STRING, allowNull: true },
    description: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: 'amenities',
    timestamps: false
  });
  return Amenity;
}; 