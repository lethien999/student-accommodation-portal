const express = require('express');
const router = express.Router();
const {
  createReview,
  getAccommodationReviews,
  updateReview,
  deleteReview,
  getPendingReviews,
  processReview,
  getProcessedReviews,
  getMyReviews
} = require('../../controllers/reviewController');
const { auth } = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');
const { cacheMiddleware } = require('../../middleware/cache');
const { uploadReview } = require('../../middleware/upload');

// Public routes
router.get('/accommodation/:accommodationId', cacheMiddleware, getAccommodationReviews);

// Protected routes
router.post('/', auth, uploadReview, createReview);
router.put('/:id', auth, uploadReview, updateReview);
router.delete('/:reviewId', auth, deleteReview);
router.get('/my-reviews', auth, getMyReviews);

// Moderator routes
router.get('/pending', auth, checkPermission('moderator'), getPendingReviews);
router.get('/processed', auth, checkPermission('moderator'), getProcessedReviews);
router.put('/:reviewId/process', auth, checkPermission('moderator'), processReview);

module.exports = router; 