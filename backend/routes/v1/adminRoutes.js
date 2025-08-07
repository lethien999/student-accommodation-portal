const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../../middleware/auth');
const adminController = require('../../controllers/adminController');
const { activityLogger } = require('../../middleware/activityLogger');

// All routes in this file are protected and for admins only
router.use(auth, authorize(['admin']));

// Dashboard stats
router.get('/overview-stats', adminController.getStats);

// User management
router.get('/users', adminController.getUsers);
router.delete('/users/:id', activityLogger('delete_user', 'admin', { resourceIdFrom: 'params' }), adminController.deleteUser);
router.put('/users/:id/lock', activityLogger('lock_user', 'admin', { resourceIdFrom: 'params' }), adminController.lockUser);
router.put('/users/:id/role', activityLogger('update_user_role', 'admin', { resourceIdFrom: 'params', includeBody: ['role'] }), adminController.updateUserRole);

module.exports = router; 