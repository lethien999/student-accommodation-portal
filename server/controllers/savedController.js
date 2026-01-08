const SavedAccommodation = require('../models/SavedAccommodation');
const Accommodation = require('../models/Accommodation');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Toggle Save Status (Save if not exists, Remove if exists)
exports.toggleSave = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { accommodationId } = req.body; // Or req.params if preferred

    const existing = await SavedAccommodation.findOne({
        where: { userId, accommodationId }
    });

    if (existing) {
        await existing.destroy();
        return res.status(200).json({
            success: true,
            message: 'Removed from favorites',
            isSaved: false
        });
    } else {
        await SavedAccommodation.create({ userId, accommodationId });
        return res.status(201).json({
            success: true,
            message: 'Added to favorites',
            isSaved: true
        });
    }
});

// Get List of Saved Accommodations
exports.getSavedList = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const savedItems = await SavedAccommodation.findAll({
        where: { userId },
        include: [
            {
                model: Accommodation,
                attributes: ['id', 'name', 'address', 'price', 'images', 'type', 'area', 'slug'] // Add other needed fields
            }
        ],
        order: [['createdAt', 'DESC']]
    });

    // Flatten structure for frontend
    const accommodations = savedItems.map(item => item.Accommodation);

    res.status(200).json({
        success: true,
        count: accommodations.length,
        accommodations
    });
});

// Check if specific accommodation is saved (Useful for initial load if not pre-fetched)
exports.checkStatus = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { accommodationId } = req.params;

    const existing = await SavedAccommodation.findOne({
        where: { userId, accommodationId }
    });

    res.status(200).json({
        success: true,
        isSaved: !!existing
    });
});
