const asyncHandler = require('express-async-handler');
const { NewsComment, User, News } = require('../models');

// @desc    Get comments for a news article
// @route   GET /api/news/:newsId/comments
// @access  Public
const getComments = asyncHandler(async (req, res) => {
  const { newsId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const news = await News.findByPk(newsId);
  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await NewsComment.findAndCountAll({
    where: { 
      newsId,
      status: 'approved',
      parentId: null // Only get top-level comments
    },
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'avatar']
      },
      {
        model: NewsComment,
        as: 'replies',
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
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset
  });

  res.status(200).json({
    comments: rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: parseInt(limit)
    }
  });
});

// @desc    Create a comment
// @route   POST /api/news/:newsId/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
  const { newsId } = req.params;
  const { content, parentId } = req.body;

  const news = await News.findByPk(newsId);
  if (!news) {
    res.status(404);
    throw new Error('News article not found');
  }

  if (!news.allowComments) {
    res.status(400);
    throw new Error('Comments are not allowed for this article');
  }

  // Check if parent comment exists if replying
  if (parentId) {
    const parentComment = await NewsComment.findByPk(parentId);
    if (!parentComment || parentComment.newsId !== parseInt(newsId)) {
      res.status(400);
      throw new Error('Invalid parent comment');
    }
  }

  const comment = await NewsComment.create({
    content,
    newsId,
    authorId: req.user.id,
    parentId,
    status: req.user.role === 'admin' ? 'approved' : 'pending_review'
  });

  const createdComment = await NewsComment.findByPk(comment.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'avatar']
      }
    ]
  });

  res.status(201).json(createdComment);
});

// @desc    Update a comment
// @route   PUT /api/news/comments/:commentId
// @access  Private
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  const comment = await NewsComment.findByPk(commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Check if user is the author or an admin
  if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this comment');
  }

  await comment.update({ content });

  const updatedComment = await NewsComment.findByPk(comment.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'avatar']
      }
    ]
  });

  res.status(200).json(updatedComment);
});

// @desc    Delete a comment
// @route   DELETE /api/news/comments/:commentId
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await NewsComment.findByPk(commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  // Check if user is the author or an admin
  if (comment.authorId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this comment');
  }

  await comment.destroy();

  res.status(200).json({ message: 'Comment removed' });
});

// @desc    Approve/Reject a comment (Admin/Moderator only)
// @route   PUT /api/news/comments/:commentId/approve
// @access  Private/Admin/Moderator
const approveComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { status, rejectionReason } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error('Invalid status. Must be "approved" or "rejected"');
  }

  const comment = await NewsComment.findByPk(commentId);
  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  const updateData = {
    status,
    moderatedBy: req.user.id,
    moderatedAt: new Date()
  };

  if (status === 'rejected' && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  await comment.update(updateData);

  const updatedComment = await NewsComment.findByPk(comment.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'avatar']
      }
    ]
  });

  res.status(200).json(updatedComment);
});

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  approveComment
}; 