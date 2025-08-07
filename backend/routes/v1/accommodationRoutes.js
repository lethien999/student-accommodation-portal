const express = require('express');
const { auth } = require('../../middleware/auth');
const upload = require('../../middleware/upload');
const { uploadAccommodation } = require('../../middleware/upload');
const {
  createAccommodation,
  getAccommodations,
  getAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getMyAccommodations,
  searchAccommodations,
  getLandlordDashboardStats,
  getHeatmapData,
  searchAccommodationsByArea
} = require('../../controllers/accommodationController');
const { optionalAuth } = require('../../middleware/auth');
const { cacheMiddleware } = require('../../middleware/cache');

const router = express.Router();

// Public routes
router.get('/', cacheMiddleware, getAccommodations);
router.get('/search', optionalAuth, searchAccommodations);

// Protected routes - specific routes first
router.get('/my-accommodations', auth, getMyAccommodations);
router.get('/landlord/stats', auth, getLandlordDashboardStats);

// Parameter routes last
router.get('/:id', optionalAuth, getAccommodation);
router.post('/', auth, uploadAccommodation, createAccommodation);
router.put('/:id', auth, uploadAccommodation, updateAccommodation);
router.delete('/:id', auth, deleteAccommodation);

router.get('/heatmap', cacheMiddleware, getHeatmapData);
router.post('/search-by-area', searchAccommodationsByArea);

module.exports = router; 