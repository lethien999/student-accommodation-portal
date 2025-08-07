const express = require('express');
const { auth } = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');
const {
  createReport,
  getReports,
  updateReportStatus,
  deleteReport,
  getModeratorStats,
  getPendingReports,
  getProcessedItems
} = require('../../controllers/reportController');
const { cacheMiddleware } = require('../../middleware/cache');

const router = express.Router();

// Protected routes
router.post('/', auth, createReport);
router.get('/', auth, checkPermission('admin'), cacheMiddleware, getReports);
router.put('/:id', auth, checkPermission('admin'), updateReportStatus);
router.delete('/:id', auth, checkPermission('admin'), deleteReport);
router.get('/moderator/stats', auth, checkPermission('moderator'), getModeratorStats);
router.get('/pending', auth, checkPermission('moderator'), getPendingReports);
router.get('/processed', auth, checkPermission('moderator'), getProcessedItems);

module.exports = router; 