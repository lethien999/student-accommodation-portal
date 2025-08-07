const asyncHandler = require('express-async-handler');
const { Review, User, Accommodation } = require('../models');

// Helper function to update accommodation average rating
const updateAccommodationRating = async (accommodationId) => {
  const reviews = await Review.findAll({ where: { accommodationId } });
  const numberOfReviews = reviews.length;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = numberOfReviews > 0 ? (totalRating / numberOfReviews).toFixed(1) : 0.0;

  await Accommodation.update(
    { averageRating, numberOfReviews },
    { where: { id: accommodationId } }
  );
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { accommodationId, rating, comment } = req.body;
  const images = req.files ? req.files.map(file => ({ url: file.path, public_id: file.filename })) : [];

  // Check if accommodation exists
  const accommodation = await Accommodation.findByPk(accommodationId);
  if (!accommodation) {
    res.status(404);
    throw new Error('Accommodation not found');
  }

  // Check if user has already reviewed this accommodation
  const existingReview = await Review.findOne({
    where: {
      userId: req.user.id,
      accommodationId
    }
  });

  if (existingReview) {
    res.status(400);
    throw new Error('You have already reviewed this accommodation');
  }

  const review = await Review.create({
    rating,
    comment,
    images,
    userId: req.user.id,
    accommodationId
  });

  await updateAccommodationRating(accommodationId);

  res.status(201).json(review);
});

// @desc    Get reviews for an accommodation
// @route   GET /api/reviews/accommodation/:accommodationId
// @access  Public
const getReviewsForAccommodation = asyncHandler(async (req, res) => {
  const { accommodationId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows } = await Review.findAndCountAll({
    where: { accommodationId: accommodationId },
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.json({
    reviews: rows,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
  });
});

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const images = req.files ? req.files.map(file => ({ url: file.path, public_id: file.filename })) : [];

  const review = await Review.findByPk(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check ownership
  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  const updateData = {
    rating: rating !== undefined ? rating : review.rating,
    comment: comment !== undefined ? comment : review.comment,
  };

  if (images.length > 0) {
    // Optionally delete old images from Cloudinary here if needed
    updateData.images = images;
  } else if (req.body.clearImages === 'true') { // Allow clearing all images
    updateData.images = [];
  }

  await review.update(updateData);

  await updateAccommodationRating(review.accommodationId);
  res.json(review);
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findByPk(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check ownership
  if (review.userId !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Optionally delete images from Cloudinary here
  // if (review.images && review.images.length > 0) {
  //   for (const image of review.images) {
  //     await cloudinary.uploader.destroy(image.public_id);
  //   }
  // }

  await review.destroy();
  await updateAccommodationRating(review.accommodationId);
  res.json({ message: 'Review removed' });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/my-reviews
// @access  Private
const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.findAll({
    where: { userId: req.user.id },
    include: [
      {
        model: Accommodation,
        as: 'accommodation',
        attributes: ['id', 'title', 'address']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.json(reviews);
});

// @desc    Get pending reviews (moderator)
// @route   GET /api/reviews/pending
// @access  Private/Moderator
const getPendingReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.findAll({
    where: { status: 'pending' },
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      { model: Accommodation, as: 'accommodation', attributes: ['id', 'title', 'address'] }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.json(reviews);
});

// @desc    Approve/Reject review (moderator)
// @route   PUT /api/reviews/:id/process
// @access  Private/Moderator
const processReview = asyncHandler(async (req, res) => {
  const { action, reason } = req.body; // action: 'approve' or 'reject'
  
  if (!['approve', 'reject'].includes(action)) {
    res.status(400);
    throw new Error('Invalid action. Must be "approve" or "reject"');
  }

  const review = await Review.findByPk(req.params.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      { model: Accommodation, as: 'accommodation', attributes: ['id', 'title', 'address'] }
    ]
  });

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const status = action === 'approve' ? 'approved' : 'rejected';
  
  await review.update({
    status,
    moderatedBy: req.user.id,
    moderatedAt: new Date(),
    moderationReason: reason || null
  });

  // If approved, update accommodation rating
  if (status === 'approved') {
    await updateAccommodationRating(review.accommodationId);
  }

  res.json({
    message: `Review ${status} successfully`,
    review
  });
});

// @desc    Get processed reviews (moderator)
// @route   GET /api/reviews/processed
// @access  Private/Moderator
const getProcessedReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  const { count, rows } = await Review.findAndCountAll({
    where: { 
      status: ['approved', 'rejected'],
      moderatedBy: req.user.id
    },
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'email'] },
      { model: Accommodation, as: 'accommodation', attributes: ['id', 'title', 'address'] }
    ],
    order: [['moderatedAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    reviews: rows,
    total: count,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page)
  });
});

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getAccommodationReviews: getReviewsForAccommodation,
  getMyReviews,
  getPendingReviews,
  processReview,
  getProcessedReviews
}; 