const accommodationService = require('../services/AccommodationService');
const catchAsync = require('../utils/catchAsync');

// @desc    Get all accommodations with filters
// @route   GET /api/accommodations
// @access  Public
const getAll = catchAsync(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const result = await accommodationService.findAll(req.query, userId);

  res.json({
    success: true,
    count: result.count,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    accommodations: result.rows
  });
});

// @desc    Get accommodation by ID
// @route   GET /api/accommodations/:id
// @access  Public
const getById = catchAsync(async (req, res) => {
  const userId = req.user ? req.user.id : null;
  const accommodation = await accommodationService.findById(req.params.id, userId);

  res.json({
    success: true,
    accommodation
  });
});

// @desc    Create new accommodation
// @route   POST /api/accommodations
// @access  Private
const create = catchAsync(async (req, res) => {
  // Pass req.user to service for ownership assignment
  const accommodation = await accommodationService.create(req.body, req.user);

  res.status(201).json({
    success: true,
    accommodation
  });
});

// @desc    Update accommodation
// @route   PUT /api/accommodations/:id
// @access  Private
const update = catchAsync(async (req, res) => {
  const accommodation = await accommodationService.update(req.params.id, req.body, req.user);

  res.json({
    success: true,
    accommodation
  });
});

// @desc    Delete accommodation
// @route   DELETE /api/accommodations/:id
// @access  Private
const remove = catchAsync(async (req, res) => {
  await accommodationService.delete(req.params.id, req.user);

  res.json({
    success: true,
    message: 'Accommodation removed'
  });
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
