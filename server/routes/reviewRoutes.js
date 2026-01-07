const express = require('express');
const router = express.Router();
const {
    getReviews,
    createReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/:accommodationId', getReviews);

// Protected routes
router.post('/', protect, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
