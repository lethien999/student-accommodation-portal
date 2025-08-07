const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const StaticPage = sequelize.define('StaticPage', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('published', 'draft'),
      defaultValue: 'draft',
    },
  });
  return StaticPage;
}; 