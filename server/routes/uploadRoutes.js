const express = require('express');
const router = express.Router();
const { uploadImage, uploadImages } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

// Protected routes - must be logged in to upload
router.post('/image', protect, uploadImage);
router.post('/images', protect, uploadImages);

module.exports = router;
