const express = require('express');
const router = express.Router();
const { authorize } = require('../../middleware/auth');
const activityController = require('../../controllers/activityController');
const { cacheMiddleware } = require('../../middleware/cache');

// Routes cho quản lý activity logs (chỉ admin và moderator)
router.get('/activities', authorize(['admin', 'moderator']), cacheMiddleware, activityController.getActivityLogs);
router.get('/activities/stats', authorize(['admin', 'moderator']), cacheMiddleware, activityController.getActivityStats);
router.get('/activities/export', authorize(['admin', 'moderator']), cacheMiddleware, activityController.exportActivityLogs);
router.get('/activities/actions', authorize(['admin', 'moderator']), cacheMiddleware, activityController.getAvailableActions);
router.get('/activities/modules', authorize(['admin', 'moderator']), cacheMiddleware, activityController.getAvailableModules);
router.delete('/activities/cleanup', authorize(['admin']), activityController.cleanupOldLogs);

// Routes cho xem activity logs của user cụ thể
router.get('/users/:userId/activities', authorize(['admin', 'moderator']), activityController.getUserActivityLogs);

module.exports = router; 