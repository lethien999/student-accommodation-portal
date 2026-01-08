const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');
const { bookingValidationRules } = require('../middleware/validator');

// All routes are protected
router.use(protect);

router.post(
    '/',
    bookingValidationRules.create,
    bookingController.createBooking
);

router.get('/my-bookings', bookingController.getMyBookings);

router.get(
    '/landlord-requests',
    authorize('landlord', 'admin'),
    bookingController.getLandlordRequests
);

router.patch(
    '/:id/status',
    bookingValidationRules.updateStatus,
    bookingController.updateStatus
);

module.exports = router;
