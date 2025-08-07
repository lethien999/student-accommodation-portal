const express = require('express');
const router = express.Router();
const staticPageController = require('../../controllers/staticPageController');
const { cacheMiddleware } = require('../../middleware/cache');

router.get('/', cacheMiddleware, staticPageController.getAll);
router.get('/:id', staticPageController.getById);
router.post('/', staticPageController.create);
router.put('/:id', staticPageController.update);
router.delete('/:id', staticPageController.delete);

module.exports = router; 