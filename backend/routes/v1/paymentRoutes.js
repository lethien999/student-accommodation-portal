const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const paymentController = require('../../controllers/paymentController');
const { cacheMiddleware } = require('../../middleware/cache');
const { activityLogger } = require('../../middleware/activityLogger');

// Protected routes
router.post('/', auth, paymentController.createPayment);
router.get('/history', auth, cacheMiddleware, paymentController.getPaymentHistory);
router.get('/:paymentId', auth, paymentController.getPaymentDetails);
router.get('/:paymentId/invoice', auth, paymentController.getPaymentInvoice);
router.get('/:paymentId/invoice/download', auth, paymentController.downloadInvoice);

// Payment callback routes (no auth required)
router.get('/callback/:paymentMethod', paymentController.handlePaymentCallback);
router.post('/callback/zalopay', paymentController.handleZaloPayCallback); // ZaloPay IPN

// All routes are protected
router.use(auth);

router.post('/create', activityLogger('create_payment', 'payment', { includeBody: ['amount', 'orderInfo'] }), paymentController.createPayment);
// router.get('/vnpay_return', activityLogger('vnpay_callback', 'payment'), paymentController.handleVNPayReturn);
// router.get('/momo_return', activityLogger('momo_callback', 'payment'), paymentController.handleMomoReturn);
// router.get('/status/:orderId', paymentController.getPaymentStatus);

module.exports = router; 