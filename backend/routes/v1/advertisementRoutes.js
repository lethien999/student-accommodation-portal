const express = require('express');
const { auth, authorize } = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');
const {
  createAdvertisement,
  getAdvertisements,
  getAdvertisementById,
  updateAdvertisement,
  deleteAdvertisement,
  approveAdvertisement,
  getAdvertisementStats,
  getAdvertisementPositions,
  recordImpression,
  recordClick,
  getActiveAdvertisements,
  getUserAdvertisements
} = require('../../controllers/advertisementController');
const { cacheMiddleware } = require('../../middleware/cache');
const { uploadAdvertisement } = require('../../middleware/upload');

const router = express.Router();

// === Public Routes ===
router.get('/', cacheMiddleware, getAdvertisements);
router.get('/active', getActiveAdvertisements); // For homepage display
router.get('/positions', getAdvertisementPositions);
router.get('/:id', getAdvertisementById);
router.post('/:id/impression', recordImpression);
router.get('/:id/click', recordClick); // Should be GET for redirect, or POST if client handles it

// === Protected Routes (Landlord, Moderator, Admin) ===
router.use(auth); // Apply auth middleware for all subsequent routes

router.post('/', auth, checkPermission('advertisement:create'), uploadAdvertisement, createAdvertisement);
router.get('/my-ads', authorize(['admin', 'landlord']), getUserAdvertisements);
router.put('/:id', auth, checkPermission('advertisement:update'), uploadAdvertisement, updateAdvertisement);
router.delete('/:id', authorize(['admin', 'landlord']), deleteAdvertisement);

// === Admin & Moderator Only Routes ===
router.put('/:id/approve', authorize(['admin', 'moderator']), approveAdvertisement);
router.get('/stats/:id', authorize(['admin', 'moderator']), getAdvertisementStats);

module.exports = router; 