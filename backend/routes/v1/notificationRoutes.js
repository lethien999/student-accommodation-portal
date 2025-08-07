const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/notificationController');
const notificationTemplateController = require('../../controllers/notificationTemplateController');
const { auth } = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');
const { cacheMiddleware } = require('../../middleware/cache');

// Notification routes
router.get('/', auth, checkPermission('notification:read'), cacheMiddleware, notificationController.getNotifications);
router.get('/stats', auth, checkPermission('notification:read'), notificationController.getNotificationStats);
router.get('/:id', auth, checkPermission('notification:read'), notificationController.getNotificationById);
router.post('/', auth, checkPermission('notification:create'), notificationController.createNotification);
router.put('/:id', auth, checkPermission('notification:update'), notificationController.updateNotification);
router.delete('/:id', auth, checkPermission('notification:delete'), notificationController.deleteNotification);
router.post('/:id/send', auth, checkPermission('notification:send'), notificationController.sendNotification);
router.post('/push/subscribe', auth, notificationController.subscribePush);
router.post('/push/unsubscribe', auth, notificationController.unsubscribePush);
router.post('/push/test', auth, notificationController.sendTestPush);

// Notification template routes
router.get('/templates', auth, checkPermission('notification:read'), notificationTemplateController.getTemplates);
router.get('/templates/stats', auth, checkPermission('notification:read'), notificationTemplateController.getTemplateStats);
router.get('/templates/:id', auth, checkPermission('notification:read'), notificationTemplateController.getTemplateById);
router.post('/templates', auth, checkPermission('notification:create'), notificationTemplateController.createTemplate);
router.put('/templates/:id', auth, checkPermission('notification:update'), notificationTemplateController.updateTemplate);
router.delete('/templates/:id', auth, checkPermission('notification:delete'), notificationTemplateController.deleteTemplate);
router.put('/templates/:id/toggle', auth, checkPermission('notification:update'), notificationTemplateController.toggleTemplateStatus);

module.exports = router; 