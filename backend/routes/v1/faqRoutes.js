const express = require('express');
const router = express.Router();
const faqController = require('../../controllers/faqController');
const { auth, authorize } = require('../../middleware/auth');
const { cacheMiddleware } = require('../../middleware/cache');

// Public routes
router.get('/', cacheMiddleware, faqController.getAll);
router.get('/search', faqController.search);
router.get('/category/:category', faqController.getByCategory);
router.get('/:id', faqController.getById);

// Admin only routes
router.post('/', auth, authorize(['admin']), faqController.create);
router.put('/:id', auth, authorize(['admin']), faqController.update);
router.delete('/:id', auth, authorize(['admin']), faqController.delete);

module.exports = router; 