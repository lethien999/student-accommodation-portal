module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
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
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    module: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Module this permission belongs to (e.g., accommodation, user, review)'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Action this permission allows (e.g., create, read, update, delete)'
    }
  }, {
    tableName: 'permissions',
    timestamps: true
  });
  return Permission;
}; 