/**
 * Billing Routes
 * 
 * API routes for rent billing management.
 * 
 * @module routes/v1/billingRoutes
 */
const express = require('express');
const router = express.Router();
const billingController = require('../../controllers/billingController');
const { auth, authorize } = require('../../middleware/auth');

// All routes require authentication
router.use(auth);

/**
 * Tenant routes
 */
router.get('/my-bills', billingController.getTenantBillings);

/**
 * Landlord/Admin routes
 */

/**
 * @route GET /api/v1/billings
 * @desc Get all billings for landlord
 * @access Landlord, Admin
 */
router.get('/', authorize(['landlord', 'admin']), billingController.getMyBillings);

/**
 * @route GET /api/v1/billings/stats/overview
 * @desc Get billing statistics
 * @access Landlord, Admin
 */
router.get('/stats/overview', authorize(['landlord', 'admin']), billingController.getBillingStats);

/**
 * @route GET /api/v1/billings/:id
 * @desc Get single billing by ID
 * @access Landlord, Tenant, Admin
 */
router.get('/:id', billingController.getBillingById);

/**
 * @route POST /api/v1/billings
 * @desc Create new billing
 * @access Landlord, Admin
 */
router.post('/', authorize(['landlord', 'admin']), billingController.createBilling);

/**
 * @route POST /api/v1/billings/generate
 * @desc Generate monthly billings for all active contracts
 * @access Landlord, Admin
 */
router.post('/generate', authorize(['landlord', 'admin']), billingController.generateBillings);

/**
 * @route PUT /api/v1/billings/:id/readings
 * @desc Update meter readings
 * @access Landlord, Admin
 */
router.put('/:id/readings', authorize(['landlord', 'admin']), billingController.updateReadings);

/**
 * @route PUT /api/v1/billings/:id/publish
 * @desc Publish billing (send to tenant)
 * @access Landlord, Admin
 */
router.put('/:id/publish', authorize(['landlord', 'admin']), billingController.publishBilling);

/**
 * @route POST /api/v1/billings/:id/payment
 * @desc Record payment for billing
 * @access Landlord, Admin
 */
router.post('/:id/payment', authorize(['landlord', 'admin']), billingController.recordPayment);

/**
 * @route DELETE /api/v1/billings/:id
 * @desc Cancel billing
 * @access Landlord, Admin
 */
router.delete('/:id', authorize(['landlord', 'admin']), billingController.cancelBilling);

module.exports = router;
