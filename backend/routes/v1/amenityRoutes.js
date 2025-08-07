const express = require('express');
const router = express.Router();
const {
  getAmenities,
  getAmenity,
  createAmenity,
  updateAmenity,
  deleteAmenity,
  getAccommodationAmenities,
  addAmenityToAccommodation,
  removeAmenityFromAccommodation
} = require('../../controllers/amenityController');
const { auth } = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');
const { cacheMiddleware } = require('../../middleware/cache');

// Lấy danh sách tiện ích
router.get('/', cacheMiddleware, getAmenities);

// Lấy chi tiết tiện ích
router.get('/:id', getAmenity);

// Tạo tiện ích mới
router.post('/', auth, checkPermission('amenity:create'), createAmenity);

// Cập nhật tiện ích
router.put('/:id', auth, checkPermission('amenity:update'), updateAmenity);

// Xóa tiện ích
router.delete('/:id', auth, checkPermission('amenity:delete'), deleteAmenity);

// Lấy tiện ích của accommodation
router.get('/accommodation/:accommodationId', getAccommodationAmenities);

// Thêm tiện ích cho accommodation
router.post('/accommodation', auth, checkPermission('amenity:update'), addAmenityToAccommodation);

// Xóa tiện ích khỏi accommodation
router.delete('/accommodation/:accommodationId/:amenityId', auth, checkPermission('amenity:update'), removeAmenityFromAccommodation);

module.exports = router; 