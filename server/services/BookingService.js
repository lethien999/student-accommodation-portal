const Booking = require('../models/Booking');
const Accommodation = require('../models/Accommodation');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { Op } = require('sequelize');

class BookingService {
    async createBooking(userId, data) {
        const { accommodationId, checkInDate, checkOutDate, totalPrice, note, type = 'viewing', numOfPeople, phoneNumber } = data;

        // 1. Basic Validation
        const checkIn = new Date(checkInDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkIn < today) {
            throw new AppError('Date cannot be in the past', 400);
        }

        // Validation for 'rental' type
        if (type === 'rental') {
            if (!checkOutDate) throw new AppError('Check-out date is required for rental', 400);
            const checkOut = new Date(checkOutDate);
            if (checkOut <= checkIn) {
                throw new AppError('Check-out date must be after check-in date', 400);
            }
        }

        // 2. Check Accommodation Exists
        const accommodation = await Accommodation.findByPk(accommodationId);
        if (!accommodation) {
            throw new AppError('Accommodation not found', 404);
        }

        // 3. Prevent Booking Own Property
        if (accommodation.ownerId === userId) {
            throw new AppError('You cannot book your own property', 400);
        }

        // 4. Create Booking
        const booking = await Booking.create({
            userId,
            accommodationId,
            checkInDate,
            checkOutDate: type === 'rental' ? checkOutDate : null,
            totalPrice: type === 'rental' ? totalPrice : null,
            note,
            status: 'pending',
            type,
            numOfPeople: numOfPeople || 1,
            phoneNumber
        });

        return booking;
    }

    async getUserBookings(userId) {
        return await Booking.findAll({
            where: { userId },
            include: [
                {
                    model: Accommodation,
                    as: 'accommodation',
                    attributes: ['id', 'name', 'address', 'price', 'images']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async getLandlordRequests(landlordId) {
        return await Booking.findAll({
            include: [
                {
                    model: Accommodation,
                    as: 'accommodation',
                    where: { ownerId: landlordId },
                    attributes: ['id', 'name']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'email', 'fullName', 'phone']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async updateStatus(bookingId, status, userId, userRole) {
        const booking = await Booking.findByPk(bookingId, {
            include: [{ model: Accommodation, as: 'accommodation' }]
        });

        if (!booking) {
            throw new AppError('Request not found', 404);
        }

        const isLandlord = booking.accommodation.ownerId === userId;
        const isRenter = booking.userId === userId;
        const isAdmin = userRole === 'admin';

        if (status === 'cancelled') {
            if (!isRenter && !isLandlord && !isAdmin) {
                throw new AppError('Not authorized to cancel', 403);
            }
        } else if (status === 'confirmed' || status === 'rejected') {
            if (!isLandlord && !isAdmin) {
                throw new AppError('Only landlord can confirm/reject', 403);
            }
        } else {
            throw new AppError('Invalid status update', 400);
        }

        booking.status = status;
        await booking.save();
        return booking;
    }
}

module.exports = new BookingService();
