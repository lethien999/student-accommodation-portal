const express = require('express');
const router = express.Router();
const {
    getReviews,
    createReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { reviewValidation } = require('../middleware/validator');

// Public routes
router.get('/:accommodationId', reviewValidation.getByAccommodation, getReviews);

// Protected routes
router.post('/', protect, reviewValidation.create, createReview);
router.delete('/:id', protect, reviewValidation.delete, deleteReview);

module.exports = router;
