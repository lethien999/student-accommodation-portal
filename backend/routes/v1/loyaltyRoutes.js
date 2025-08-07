const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const loyaltyController = require('../../controllers/loyaltyController');

// All routes are protected
router.use(auth);

router.get('/history', loyaltyController.getHistory);
router.get('/balance', loyaltyController.getBalance);

module.exports = router; 