const express = require('express');
const { auth, authorize, optionalAuth } = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');
const newsController = require('../../controllers/newsController');
const newsCategoryController = require('../../controllers/newsCategoryController');
const newsCommentController = require('../../controllers/newsCommentController');
const { cacheMiddleware } = require('../../middleware/cache');
const { uploadNews } = require('../../middleware/upload');

const router = express.Router();

// === News Articles Routes ===
router.get('/', cacheMiddleware, newsController.getNews);
router.get('/:slug', newsController.getNewsBySlug); // Public route to view a single news article
router.get('/id/:id', newsController.getNewsById); // For admin to get by ID

router.post('/', auth, checkPermission('news:create'), uploadNews, newsController.createNews);
router.put('/:id', auth, checkPermission('news:update'), uploadNews, newsController.updateNews);
router.delete('/:id', auth, authorize(['admin', 'author']), newsController.deleteNews);
router.put('/:id/approve', auth, authorize(['admin', 'moderator']), newsController.approveNews);
router.get('/:id/related', newsController.getRelatedNews);


// === News Categories Routes ===
router.get('/categories', newsCategoryController.getCategories);
router.get('/categories/tree', newsCategoryController.getCategoryTree);
router.get('/categories/:slug', newsCategoryController.getCategoryBySlug);
router.post('/categories', auth, authorize(['admin']), newsCategoryController.createCategory);
router.put('/categories/:id', auth, authorize(['admin']), newsCategoryController.updateCategory);
router.delete('/categories/:id', auth, authorize(['admin']), newsCategoryController.deleteCategory);


// === News Comments Routes ===
router.get('/:newsId/comments', newsCommentController.getComments);
router.post('/:newsId/comments', auth, newsCommentController.createComment);

router.put('/comments/:commentId', auth, newsCommentController.updateComment);
router.delete('/comments/:commentId', auth, newsCommentController.deleteComment);
router.put('/comments/:commentId/approve', auth, authorize(['admin', 'moderator']), newsCommentController.approveComment);

module.exports = router; 