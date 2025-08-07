module.exports = (sequelize, DataTypes) => {
  const NewsCategory = sequelize.define('NewsCategory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100]
      }
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [1, 100]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '#1976d2'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    metaTitle: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 60]
      }
    },
    metaDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 160]
      }
    },
    articleCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    customFields: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    tableName: 'news_categories',
    timestamps: true,
    hooks: {
      beforeSave: async (category) => {
        if (!category.slug && category.name) {
          category.slug = category.name
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        }
        if (!category.metaTitle && category.name) {
          category.metaTitle = category.name.length > 60 
            ? category.name.substring(0, 57) + '...' 
            : category.name;
        }
        if (!category.metaDescription && category.description) {
          category.metaDescription = category.description.length > 160 
            ? category.description.substring(0, 157) + '...' 
            : category.description;
        }
      }
    },
    indexes: [
      { fields: ['slug'] },
      { fields: ['parentId'] },
      { fields: ['isActive'] },
      { fields: ['sortOrder'] }
    ]
  });
  return NewsCategory;
}; 