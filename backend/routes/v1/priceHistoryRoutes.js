const express = require('express');
const router = express.Router();
const {
  getPriceHistory,
  getAllPriceHistory,
  addPriceHistory,
  deletePriceHistory,
  getPriceStats,
  exportPriceHistory
} = require('../../controllers/priceHistoryController');
const { auth } = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');
const { cacheMiddleware } = require('../../middleware/cache');

// Lấy lịch sử giá của accommodation
router.get('/accommodation/:accommodationId', auth, checkPermission('price:read'), getPriceHistory);

// Lấy tất cả lịch sử giá
router.get('/', auth, checkPermission('price:read'), cacheMiddleware, getAllPriceHistory);

// Thêm lịch sử giá
router.post('/', auth, checkPermission('price:create'), addPriceHistory);

// Xóa lịch sử giá
router.delete('/:id', auth, checkPermission('price:delete'), deletePriceHistory);

// Lấy thống kê giá
router.get('/accommodation/:accommodationId/stats', auth, checkPermission('price:read'), getPriceStats);

// Export lịch sử giá
router.get('/accommodation/:accommodationId/export', auth, checkPermission('price:export'), exportPriceHistory);

module.exports = router; 