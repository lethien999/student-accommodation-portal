const express = require('express');
const { auth } = require('../../middleware/auth');
const favoriteController = require('../../controllers/favoriteController2');
console.log('DEBUG favoriteController:', favoriteController);
console.log('DEBUG auth:', auth);

const router = express.Router();

// Protected routes
router.post('/', auth, favoriteController.addToFavorites);
router.delete('/:accommodationId', auth, favoriteController.removeFromFavorites);
router.get('/', auth, favoriteController.getFavorites);

module.exports = router; 