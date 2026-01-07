const reviewService = require('../services/ReviewService');
const catchAsync = require('../utils/catchAsync');

// @desc    Get reviews for accommodation
// @route   GET /api/reviews/:accommodationId
// @access  Public
const getReviews = catchAsync(async (req, res) => {
    const reviews = await reviewService.getByAccommodationId(req.params.accommodationId);

    res.json({
        success: true,
        count: reviews.length,
        reviews
    });
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = catchAsync(async (req, res) => {
    const review = await reviewService.create(req.body, req.user);

    res.status(201).json({
        success: true,
        review
    });
});

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = catchAsync(async (req, res) => {
    await reviewService.delete(req.params.id, req.user);

    res.json({
        success: true,
        message: 'Review removed'
    });
});

module.exports = {
    getReviews,
    createReview,
    deleteReview
};
