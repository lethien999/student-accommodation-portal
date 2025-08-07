'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create news_categories table
    await queryInterface.createTable('news_categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'news_categories',
          key: 'id'
        }
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true
      },
      color: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: '#1976d2'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      sortOrder: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      metaTitle: {
        type: Sequelize.STRING,
        allowNull: true
      },
      metaDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      articleCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      customFields: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create news table
    await queryInterface.createTable('news', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      excerpt: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      featuredImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'news_categories',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived', 'pending_review'),
        allowNull: false,
        defaultValue: 'draft'
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      metaTitle: {
        type: Sequelize.STRING,
        allowNull: true
      },
      metaDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metaKeywords: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      viewCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      isFeatured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      isSticky: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      allowComments: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      seoScore: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      readingTime: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      socialShares: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {
          facebook: 0,
          twitter: 0,
          linkedin: 0,
          whatsapp: 0
        }
      },
      relatedArticles: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      },
      customFields: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      },
      approvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create news_comments table
    await queryInterface.createTable('news_comments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      newsId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'news',
          key: 'id'
        }
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'news_comments',
          key: 'id'
        }
      },
      authorName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      authorEmail: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'spam', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      ipAddress: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userAgent: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isAnonymous: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      likes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      dislikes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      spamScore: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      approvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Create indexes
    await queryInterface.addIndex('news_categories', ['slug']);
    await queryInterface.addIndex('news_categories', ['parentId']);
    await queryInterface.addIndex('news_categories', ['isActive']);
    await queryInterface.addIndex('news_categories', ['sortOrder']);

    await queryInterface.addIndex('news', ['slug']);
    await queryInterface.addIndex('news', ['status']);
    await queryInterface.addIndex('news', ['publishedAt']);
    await queryInterface.addIndex('news', ['authorId']);
    await queryInterface.addIndex('news', ['categoryId']);
    await queryInterface.addIndex('news', ['isFeatured']);
    await queryInterface.addIndex('news', ['createdAt']);

    await queryInterface.addIndex('news_comments', ['newsId']);
    await queryInterface.addIndex('news_comments', ['authorId']);
    await queryInterface.addIndex('news_comments', ['parentId']);
    await queryInterface.addIndex('news_comments', ['status']);
    await queryInterface.addIndex('news_comments', ['createdAt']);

    // Insert default categories
    await queryInterface.bulkInsert('news_categories', [
      {
        name: 'Tin tức chung',
        slug: 'tin-tuc-chung',
        description: 'Các tin tức chung về nhà trọ và sinh viên',
        color: '#1976d2',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Hướng dẫn',
        slug: 'huong-dan',
        description: 'Hướng dẫn tìm nhà trọ và các vấn đề liên quan',
        color: '#2e7d32',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Kinh nghiệm',
        slug: 'kinh-nghiem',
        description: 'Chia sẻ kinh nghiệm thuê nhà trọ',
        color: '#ed6c02',
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Thông báo',
        slug: 'thong-bao',
        description: 'Các thông báo quan trọng từ hệ thống',
        color: '#d32f2f',
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('news_comments');
    await queryInterface.dropTable('news');
    await queryInterface.dropTable('news_categories');
  }
}; 