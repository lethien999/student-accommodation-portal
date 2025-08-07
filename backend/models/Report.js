module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reporterId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reportedItemId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    reportedItemType: {
      type: DataTypes.ENUM('Accommodation', 'Review'),
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'resolved', 'rejected'),
      defaultValue: 'pending'
    },
    resolvedById: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'reports',
  });
  return Report;
}; 