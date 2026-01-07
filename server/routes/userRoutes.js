const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { userValidation } = require('../middleware/validator');

// Public routes
router.post('/register', userValidation.register, register);
router.post('/login', userValidation.login, login);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, userValidation.updateProfile, updateProfile);
router.put('/password', protect, changePassword);

module.exports = router;

