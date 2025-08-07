const express = require('express');
const router = express.Router();
const reviewRoutes = require('./reviewRoutes');

router.use('/recommendations', require('./recommendationRoutes'));
router.use('/loyalty', require('./loyaltyRoutes'));
router.use('/landlord-reputation', require('./landlordReputationRoutes'));
router.use('/events', require('./eventRoutes'));
router.use('/maintenance', require('./maintenanceRoutes'));
router.use('/reviews', reviewRoutes);

module.exports = router; 