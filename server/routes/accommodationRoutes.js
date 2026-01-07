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
const { accommodationValidation } = require('../middleware/validator');

// Public routes
router.get('/', accommodationValidation.getAll, getAll);
router.get('/:id', accommodationValidation.getById, getById);

// Protected routes
router.post('/', protect, accommodationValidation.create, create);
router.put('/:id', protect, accommodationValidation.update, update);
router.delete('/:id', protect, remove);

module.exports = router;

