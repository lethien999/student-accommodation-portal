const asyncHandler = require('express-async-handler');
const NewsCategory = require('../models/NewsCategory');
const News = require('../models/News');
const { Op } = require('sequelize');

// @desc    Create a new news category
// @route   POST /api/news/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    description,
    parentId,
    image,
    color,
    metaTitle,
    metaDescription,
    sortOrder,
    customFields
  } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  // Validate parent category if provided
  if (parentId) {
    const parentCategory = await NewsCategory.findByPk(parentId);
    if (!parentCategory) {
      res.status(400);
      throw new Error('Parent category not found');
    }
  }

  // Check if slug already exists
  if (slug) {
    const existingCategory = await NewsCategory.findOne({ where: { slug } });
    if (existingCategory) {
      res.status(400);
      throw new Error('Slug already exists');
    }
  }

  const category = await NewsCategory.create({
    name,
    slug,
    description,
    parentId,
    image,
    color: color || '#1976d2',
    metaTitle,
    metaDescription,
    sortOrder: sortOrder || 0,
    customFields: customFields ? JSON.parse(customFields) : {}
  });

  res.status(201).json(category);
});

// @desc    Get all news categories
// @route   GET /api/news/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { includeArticles = false, activeOnly = true } = req.query;

  const whereClause = {};
  if (activeOnly === 'true') {
    whereClause.isActive = true;
  }

  const includeClause = [];
  if (includeArticles === 'true') {
    includeClause.push({
      model: News,
      as: 'articles',
      where: { status: 'published' },
      required: false,
      attributes: ['id', 'title', 'slug', 'publishedAt']
    });
  }

  const categories = await NewsCategory.findAll({
    where: whereClause,
    include: [
      ...includeClause,
      {
        model: NewsCategory,
        as: 'parent',
        attributes: ['id', 'name', 'slug'],
        required: false
      },
      {
        model: NewsCategory,
        as: 'children',
        attributes: ['id', 'name', 'slug', 'articleCount'],
        required: false,
        where: { isActive: true }
      }
    ],
    order: [
      ['sortOrder', 'ASC'],
      ['name', 'ASC']
    ]
  });

  res.status(200).json(categories);
});

// @desc    Get category by slug
// @route   GET /api/news/categories/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const category = await NewsCategory.findOne({
    where: { slug, isActive: true },
    include: [
      {
        model: NewsCategory,
        as: 'parent',
        attributes: ['id', 'name', 'slug'],
        required: false
      },
      {
        model: NewsCategory,
        as: 'children',
        attributes: ['id', 'name', 'slug', 'articleCount'],
        required: false,
        where: { isActive: true }
      }
    ]
  });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Get articles in this category
  const offset = (page - 1) * limit;
  const articles = await News.findAndCountAll({
    where: {
      categoryId: category.id,
      status: 'published',
      publishedAt: { [Op.lte]: new Date() }
    },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'avatar']
      }
    ],
    order: [['publishedAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.status(200).json({
    category,
    articles: articles.rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(articles.count / limit),
      totalItems: articles.count,
      itemsPerPage: parseInt(limit)
    }
  });
});

// @desc    Get category by ID
// @route   GET /api/news/categories/id/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await NewsCategory.findByPk(req.params.id, {
    include: [
      {
        model: NewsCategory,
        as: 'parent',
        attributes: ['id', 'name', 'slug'],
        required: false
      },
      {
        model: NewsCategory,
        as: 'children',
        attributes: ['id', 'name', 'slug', 'articleCount'],
        required: false
      }
    ]
  });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.status(200).json(category);
});

// @desc    Update category
// @route   PUT /api/news/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    description,
    parentId,
    image,
    color,
    isActive,
    metaTitle,
    metaDescription,
    sortOrder,
    customFields
  } = req.body;

  const category = await NewsCategory.findByPk(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Validate parent category if provided
  if (parentId && parentId !== category.parentId) {
    const parentCategory = await NewsCategory.findByPk(parentId);
    if (!parentCategory) {
      res.status(400);
      throw new Error('Parent category not found');
    }
    
    // Prevent circular reference
    if (parentId === category.id) {
      res.status(400);
      throw new Error('Category cannot be its own parent');
    }
  }

  // Check if slug already exists (excluding current category)
  if (slug && slug !== category.slug) {
    const existingCategory = await NewsCategory.findOne({ where: { slug } });
    if (existingCategory) {
      res.status(400);
      throw new Error('Slug already exists');
    }
  }

  const updateData = {
    name: name || category.name,
    slug: slug || category.slug,
    description: description !== undefined ? description : category.description,
    parentId: parentId !== undefined ? parentId : category.parentId,
    image: image || category.image,
    color: color || category.color,
    isActive: isActive !== undefined ? isActive : category.isActive,
    metaTitle: metaTitle || category.metaTitle,
    metaDescription: metaDescription || category.metaDescription,
    sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
    customFields: customFields ? JSON.parse(customFields) : category.customFields
  };

  await category.update(updateData);

  const updatedCategory = await NewsCategory.findByPk(category.id, {
    include: [
      {
        model: NewsCategory,
        as: 'parent',
        attributes: ['id', 'name', 'slug'],
        required: false
      },
      {
        model: NewsCategory,
        as: 'children',
        attributes: ['id', 'name', 'slug', 'articleCount'],
        required: false
      }
    ]
  });

  res.status(200).json(updatedCategory);
});

// @desc    Delete category
// @route   DELETE /api/news/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await NewsCategory.findByPk(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if category has articles
  const articleCount = await News.count({ where: { categoryId: category.id } });
  if (articleCount > 0) {
    res.status(400);
    throw new Error('Cannot delete category with existing articles');
  }

  // Check if category has children
  const childrenCount = await NewsCategory.count({ where: { parentId: category.id } });
  if (childrenCount > 0) {
    res.status(400);
    throw new Error('Cannot delete category with subcategories');
  }

  await category.destroy();

  res.status(200).json({ message: 'Category removed' });
});

// @desc    Get category tree
// @route   GET /api/news/categories/tree
// @access  Public
const getCategoryTree = asyncHandler(async (req, res) => {
  const categories = await NewsCategory.findAll({
    where: { isActive: true },
    include: [
      {
        model: NewsCategory,
        as: 'children',
        where: { isActive: true },
        required: false,
        include: [
          {
            model: NewsCategory,
            as: 'children',
            where: { isActive: true },
            required: false
          }
        ]
      }
    ],
    where: { parentId: null },
    order: [
      ['sortOrder', 'ASC'],
      ['name', 'ASC']
    ]
  });

  res.status(200).json(categories);
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategoryTree
}; 