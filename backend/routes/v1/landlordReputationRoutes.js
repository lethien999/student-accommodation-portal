const express = require('express');
const router = express.Router();
const { getLandlordReputation, calculateReputation } = require('../../controllers/landlordReputationController');
const { auth } = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');

// Public route to get a landlord's reputation
router.get('/:userId/reputation', getLandlordReputation);

// Protected admin route to manually trigger a reputation calculation
router.post('/:userId/reputation/calculate', auth, checkPermission('manage_reputation'), calculateReputation);

module.exports = router; 