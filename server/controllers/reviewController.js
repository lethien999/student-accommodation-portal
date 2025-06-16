const Review = require('../models/Review');
const User = require('../models/User');
const Accommodation = require('../models/Accommodation');

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { accommodationId, rating, comment } = req.body;

    // Check if accommodation exists
    const accommodation = await Accommodation.findByPk(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Check if user has already reviewed this accommodation
    const existingReview = await Review.findOne({
      where: {
        userId: req.user.id,
        accommodationId
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this accommodation' });
    }

    const review = await Review.create({
      rating,
      comment,
      userId: req.user.id,
      accommodationId
    });

    // Include user information in response
    const reviewWithUser = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }]
    });

    res.status(201).json(reviewWithUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all reviews for an accommodation
// @route   GET /api/reviews/accommodation/:id
// @access  Public
const getAccommodationReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: {
        accommodationId: req.params.id
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }],
      order: [['createdAt', 'DESC']]
    });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the review owner
    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    const { rating, comment } = req.body;

    await review.update({
      rating: rating || review.rating,
      comment: comment || review.comment
    });

    const updatedReview = await Review.findByPk(review.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username']
      }]
    });

    res.json(updatedReview);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user is the review owner
    if (review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.destroy();
    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createReview,
  getAccommodationReviews,
  updateReview,
  deleteReview
}; 