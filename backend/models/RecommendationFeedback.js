module.exports = (sequelize, DataTypes) => {
  const RecommendationFeedback = sequelize.define('RecommendationFeedback', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    accommodationId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    feedbackType: {
      type: DataTypes.ENUM('like', 'dislike'),
      allowNull: false
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });
  RecommendationFeedback.associate = models => {
    RecommendationFeedback.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    RecommendationFeedback.belongsTo(models.Accommodation, { foreignKey: 'accommodationId', as: 'accommodation' });
  };
  return RecommendationFeedback;
}; 