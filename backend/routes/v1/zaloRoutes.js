/**
 * ZaloOA Routes
 * 
 * API routes for Zalo OA integration.
 * 
 * @module routes/v1/zaloRoutes
 */
const express = require('express');
const router = express.Router();
const zaloOAController = require('../../controllers/zaloOAController');
const { protect, authorize } = require('../../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * @route GET /api/v1/zalo/status
 * @desc Check if ZaloOA is configured
 * @access Landlord, Admin
 */
router.get('/status', authorize('landlord', 'admin'), zaloOAController.getStatus);

/**
 * @route POST /api/v1/zalo/send-billing/:billingId
 * @desc Send billing notification to tenant
 * @access Landlord, Admin
 */
router.post('/send-billing/:billingId', authorize('landlord', 'admin'), zaloOAController.sendBillingNotification);

/**
 * @route POST /api/v1/zalo/send-billing-qr/:billingId
 * @desc Send billing with QR code
 * @access Landlord, Admin
 */
router.post('/send-billing-qr/:billingId', authorize('landlord', 'admin'), zaloOAController.sendBillingWithQR);

/**
 * @route POST /api/v1/zalo/send-reminder/:billingId
 * @desc Send payment reminder
 * @access Landlord, Admin
 */
router.post('/send-reminder/:billingId', authorize('landlord', 'admin'), zaloOAController.sendPaymentReminder);

/**
 * @route POST /api/v1/zalo/generate-qr
 * @desc Generate payment QR code
 * @access Landlord, Admin
 */
router.post('/generate-qr', authorize('landlord', 'admin'), zaloOAController.generatePaymentQR);

/**
 * @route POST /api/v1/zalo/send-message
 * @desc Send custom text message
 * @access Landlord, Admin
 */
router.post('/send-message', authorize('landlord', 'admin'), zaloOAController.sendMessage);

/**
 * @route POST /api/v1/zalo/broadcast
 * @desc Broadcast message to all followers
 * @access Admin only
 */
router.post('/broadcast', authorize('admin'), zaloOAController.broadcastMessage);

module.exports = router;
