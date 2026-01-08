const bookingService = require('../services/BookingService');
const catchAsync = require('../utils/catchAsync');

const createBooking = catchAsync(async (req, res) => {
    const booking = await bookingService.createBooking(req.user.id, req.body);
    res.status(201).json({
        success: true,
        data: booking
    });
});

const getMyBookings = catchAsync(async (req, res) => {
    const bookings = await bookingService.getUserBookings(req.user.id);
    res.status(200).json({
        success: true,
        results: bookings.length,
        bookings
    });
});

const getLandlordRequests = catchAsync(async (req, res) => {
    const bookings = await bookingService.getLandlordRequests(req.user.id);
    res.status(200).json({
        success: true,
        results: bookings.length,
        bookings
    });
});

const updateStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await bookingService.updateStatus(id, status, req.user.id, req.user.role);
    res.status(200).json({
        success: true,
        data: booking
    });
});

module.exports = {
    createBooking,
    getMyBookings,
    getLandlordRequests,
    updateStatus
};
