const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../../middleware/auth');
const preferenceController = require('../../controllers/preferenceController');
const { cacheMiddleware } = require('../../middleware/cache');

// Routes cho tùy chọn cá nhân (user có thể truy cập tùy chọn của mình)
router.get('/', auth, cacheMiddleware, preferenceController.getUserPreferences);
router.get('/defaults', auth, preferenceController.getDefaultPreferences);
router.get('/:category', auth, preferenceController.getPreferencesByCategory);
router.get('/:category/:key', auth, preferenceController.getPreference);
router.post('/', auth, preferenceController.setPreference);
router.post('/multiple', auth, preferenceController.setMultiplePreferences);
router.delete('/:category/:key', auth, preferenceController.deletePreference);
router.delete('/reset/:category?', auth, preferenceController.resetPreferences);

// Routes cho admin quản lý tùy chọn của user khác
router.get('/by-user/:userId', auth, authorize(['admin']), preferenceController.getUserPreferences);
router.get('/by-user/:userId/:category', auth, authorize(['admin']), preferenceController.getPreferencesByCategory);
router.get('/by-user/:userId/:category/:key', auth, authorize(['admin']), preferenceController.getPreference);
router.post('/by-user/:userId', auth, authorize(['admin']), preferenceController.setPreference);
router.post('/by-user/:userId/multiple', auth, authorize(['admin']), preferenceController.setMultiplePreferences);
router.delete('/by-user/:userId/:category/:key', auth, authorize(['admin']), preferenceController.deletePreference);
router.delete('/by-user/:userId/reset/:category?', auth, authorize(['admin']), preferenceController.resetPreferences);

module.exports = router; 