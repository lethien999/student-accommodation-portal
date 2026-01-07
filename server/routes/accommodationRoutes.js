const express = require('express');
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  remove
} = require('../controllers/accommodationController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/', getAll);
router.get('/:id', getById);

// Protected routes
router.post('/', protect, create);
router.put('/:id', protect, update);
router.delete('/:id', protect, remove);

module.exports = router;

