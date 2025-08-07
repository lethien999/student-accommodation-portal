module.exports = (sequelize, DataTypes) => {
  const RentalContract = sequelize.define('RentalContract', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    accommodationId: { type: DataTypes.INTEGER, allowNull: false },
    tenantId: { type: DataTypes.INTEGER, allowNull: false },
    landlordId: { type: DataTypes.INTEGER, allowNull: false },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: false },
    deposit: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    totalAmount: { type: DataTypes.DECIMAL(10,2), allowNull: true },
    status: { type: DataTypes.ENUM('active','terminated','pending'), defaultValue: 'pending' },
    contractFile: { type: DataTypes.STRING, allowNull: true },
    note: { type: DataTypes.TEXT, allowNull: true }
  }, {
    tableName: 'rental_contracts',
    timestamps: true
  });
  return RentalContract;
}; 