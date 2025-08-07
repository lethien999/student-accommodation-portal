const express = require('express');
const router = express.Router();
const { authorize } = require('../../middleware/auth');
const roleController = require('../../controllers/roleController');
const { cacheMiddleware } = require('../../middleware/cache');

// Routes cho quản lý vai trò (chỉ admin)
router.get('/roles', authorize(['admin']), cacheMiddleware, roleController.getAllRoles);
router.post('/roles', authorize(['admin']), roleController.createRole);
router.put('/roles/:id', authorize(['admin']), roleController.updateRole);
router.delete('/roles/:id', authorize(['admin']), roleController.deleteRole);

// Routes cho quản lý quyền (chỉ admin)
router.get('/permissions', authorize(['admin']), cacheMiddleware, roleController.getAllPermissions);
router.post('/permissions', authorize(['admin']), roleController.createPermission);

// Routes cho quản lý nhóm người dùng (chỉ admin)
router.get('/groups', authorize(['admin']), cacheMiddleware, roleController.getUserGroups);
router.post('/groups', authorize(['admin']), roleController.createUserGroup);
router.put('/groups/:id', authorize(['admin']), roleController.updateUserGroup);
router.delete('/groups/:id', authorize(['admin']), roleController.deleteUserGroup);

module.exports = router; 