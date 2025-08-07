const asyncHandler = require('express-async-handler');
const { News, NewsCategory, NewsComment, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Create a new news article
// @route   POST /api/news
// @access  Private/Admin/Author
const createNews = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    categoryId,
    status,
    tags,
    metaTitle,
    metaDescription,
    metaKeywords,
    isFeatured,
    isSticky,
    allowComments,
    customFields
  } = req.body;

  const authorId = req.user.id;

  if (!title || !content) {
    res.status(400);
    throw new Error('Title and content are required');
  }

  // Validate category if provided
  if (categoryId) {
    const category = await NewsCategory.findByPk(categoryId);
    if (!category || !category.isActive) {
      res.status(400);
      throw new Error('Invalid or inactive category');
    }
  }

  // Check if slug already exists
  if (slug) {
    const existingNews = await News.findOne({ where: { slug } });
    if (existingNews) {
      res.status(400);
      throw new Error('Slug already exists');
    }
  }

  const news = await News.create({
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    categoryId,
    status: status || (req.user.role === 'admin' ? 'published' : 'draft'),
    authorId,
    tags: tags ? JSON.parse(tags) : [],
    metaTitle,
    metaDescription,
    metaKeywords: metaKeywords ? JSON.parse(metaKeywords) : [],
    isFeatured: isFeatured || false,
    isSticky: isSticky || false,
    allowComments: allowComments !== false,
    customFields: customFields ? JSON.parse(customFields) : {}
  });

  // Update category article count
  if (categoryId) {
    await NewsCategory.increment('articleCount', { where: { id: categoryId } });
  }

  const createdNews = await News.findByPk(news.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'avatar']
      },
      {
        model: NewsCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'color']
      }
    ]
  });

  res.status(201).json(createdNews);
});

// @desc    Get all news articles (with filtering)
// @route   GET /api/news
// @access  Public
const getNews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, category, search } = req.query;
  const where = {};
  if (status) where.status = status;
  if (category) where.categoryId = category;
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { content: { [Op.like]: `%${search}%` } }
    ];
  }
  const news = await News.findAndCountAll({
    where,
    include: [
      { model: User, as: 'author', attributes: ['id', 'username', 'fullName'] },
      { model: NewsCategory, as: 'category', attributes: ['id', 'name', 'slug', 'color'] }
    ],
    limit: parseInt(limit),
    offset: (parseInt(page) - 1) * parseInt(limit),
    order: [['createdAt', 'DESC']]
  });
  const normalizedNews = news.rows.map(normalizeNews);
  res.status(200).json({
    news: normalizedNews,
    total: news.count,
    totalPages: Math.ceil(news.count / limit),
    currentPage: parseInt(page)
  });
});

// @desc    Get news article by slug
// @route   GET /api/news/:slug
// @access  Public
const getNewsBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const news = await News.findOne({
    where: { 
      slug,
      status: 'published',
      publishedAt: { [Op.lte]: new Date() }
    },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'avatar']
      },
      {
        model: NewsCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'color']
      },
      {
        model: NewsComment,
        as: 'comments',
        where: { status: 'approved' },
        required: false,
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username', 'fullName', 'avatar']
          }
        ],
        order: [['createdAt', 'ASC']]
      }
    ]
  });

  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  // Increment view count
  await news.increment('viewCount');

  res.status(200).json(normalizeNews(news));
});

// @desc    Get news article by ID (for admin)
// @route   GET /api/news/id/:id
// @access  Private/Admin
const getNewsById = asyncHandler(async (req, res) => {
  const news = await News.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'avatar']
      },
      {
        model: User,
        as: 'approver',
        attributes: ['id', 'username', 'fullName'],
        required: false
      },
      {
        model: NewsCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'color']
      }
    ]
  });

  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  res.status(200).json(normalizeNews(news));
});

// @desc    Update news article
// @route   PUT /api/news/:id
// @access  Private/Admin/Author
const updateNews = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    excerpt,
    content,
    featuredImage,
    categoryId,
    status,
    tags,
    metaTitle,
    metaDescription,
    metaKeywords,
    isFeatured,
    isSticky,
    allowComments,
    customFields
  } = req.body;

  const news = await News.findByPk(req.params.id);

  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  // Check if user is the author or an admin
  if (news.authorId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this article');
  }

  // Validate category if provided
  if (categoryId) {
    const category = await NewsCategory.findByPk(categoryId);
    if (!category || !category.isActive) {
      res.status(400);
      throw new Error('Invalid or inactive category');
    }
  }

  // Check if slug already exists (excluding current article)
  if (slug && slug !== news.slug) {
    const existingNews = await News.findOne({ where: { slug } });
    if (existingNews) {
      res.status(400);
      throw new Error('Slug already exists');
    }
  }

  const oldCategoryId = news.categoryId;
  const updateData = {
    title: title || news.title,
    slug: slug || news.slug,
    excerpt: excerpt !== undefined ? excerpt : news.excerpt,
    content: content || news.content,
    featuredImage: featuredImage || news.featuredImage,
    categoryId: categoryId || news.categoryId,
    tags: tags ? JSON.parse(tags) : news.tags,
    metaTitle: metaTitle || news.metaTitle,
    metaDescription: metaDescription || news.metaDescription,
    metaKeywords: metaKeywords ? JSON.parse(metaKeywords) : news.metaKeywords,
    isFeatured: isFeatured !== undefined ? isFeatured : news.isFeatured,
    isSticky: isSticky !== undefined ? isSticky : news.isSticky,
    allowComments: allowComments !== undefined ? allowComments : news.allowComments,
    customFields: customFields ? JSON.parse(customFields) : news.customFields
  };

  // Only admins can change status
  if (status && req.user.role === 'admin') {
    updateData.status = status;
    if (status === 'published' && news.status !== 'published') {
      updateData.publishedAt = new Date();
      updateData.approvedBy = req.user.id;
      updateData.approvedAt = new Date();
    }
  }

  await news.update(updateData);

  // Update category article counts
  if (oldCategoryId !== categoryId) {
    if (oldCategoryId) {
      await NewsCategory.decrement('articleCount', { where: { id: oldCategoryId } });
    }
    if (categoryId) {
      await NewsCategory.increment('articleCount', { where: { id: categoryId } });
    }
  }

  const updatedNews = await News.findByPk(news.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'avatar']
      },
      {
        model: NewsCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'color']
      }
    ]
  });

  res.status(200).json(updatedNews);
});

// @desc    Delete news article
// @route   DELETE /api/news/:id
// @access  Private/Admin/Author
const deleteNews = asyncHandler(async (req, res) => {
  const news = await News.findByPk(req.params.id);

  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  // Check if user is the author or an admin
  if (news.authorId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this article');
  }

  // Decrement category article count
  if (news.categoryId) {
    await NewsCategory.decrement('articleCount', { where: { id: news.categoryId } });
  }

  await news.destroy();

  res.status(200).json({ message: 'News article removed' });
});

// @desc    Approve/Reject news article (Admin only)
// @route   PUT /api/news/:id/approve
// @access  Private/Admin
const approveNews = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const { id } = req.params;

  if (!['published', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Must be "published" or "rejected"');
  }

  const news = await News.findByPk(id);
  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  const updateData = {
    status,
    approvedBy: req.user.id,
    approvedAt: new Date()
  };

  if (status === 'published') {
    updateData.publishedAt = new Date();
  } else if (status === 'rejected' && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  await news.update(updateData);

  res.status(200).json(news);
});

// @desc    Get related news articles
// @route   GET /api/news/:id/related
// @access  Public
const getRelatedNews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 5 } = req.query;

  const news = await News.findByPk(id, {
    attributes: ['categoryId', 'tags']
  });

  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  const whereClause = {
    id: { [Op.ne]: id },
    status: 'published',
    publishedAt: { [Op.lte]: new Date() }
  };

  // Find related articles by category and tags
  if (news.categoryId) {
    whereClause.categoryId = news.categoryId;
  }

  const relatedNews = await News.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName']
      },
      {
        model: NewsCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'color']
      }
    ],
    order: [['publishedAt', 'DESC']],
    limit: parseInt(limit)
  });

  const normalizedRelated = relatedNews.map(normalizeNews);
  res.status(200).json(normalizedRelated);
});

// @desc    Get news statistics
// @route   GET /api/news/stats
// @access  Private/Admin
const getNewsStats = asyncHandler(async (req, res) => {
  const totalArticles = await News.count();
  const publishedArticles = await News.count({ where: { status: 'published' } });
  const draftArticles = await News.count({ where: { status: 'draft' } });
  const pendingArticles = await News.count({ where: { status: 'pending_review' } });
  const totalViews = await News.sum('viewCount');
  const featuredArticles = await News.count({ where: { isFeatured: true } });

  const stats = {
    totalArticles,
    publishedArticles,
    draftArticles,
    pendingArticles,
    totalViews: totalViews || 0,
    featuredArticles
  };

  res.status(200).json(stats);
});

// Hàm chuẩn hóa dữ liệu news trả về cho frontend
function normalizeNews(news) {
  const n = news.toJSON ? news.toJSON() : news;
  n.tags = Array.isArray(n.tags) ? n.tags : (n.tags ? n.tags : []);
  n.metaKeywords = Array.isArray(n.metaKeywords) ? n.metaKeywords : (n.metaKeywords ? n.metaKeywords : []);
  n.relatedArticles = Array.isArray(n.relatedArticles) ? n.relatedArticles : (n.relatedArticles ? n.relatedArticles : []);
  n.customFields = n.customFields && typeof n.customFields === 'object' ? n.customFields : {};
  return n;
}

module.exports = {
  createNews,
  getNews,
  getNewsBySlug,
  getNewsById,
  updateNews,
  deleteNews,
  approveNews,
  getRelatedNews,
  getNewsStats
}; 