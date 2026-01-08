const { body, param, query, validationResult } = require('express-validator');

const AppError = require('../utils/AppError');

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Combine error messages
    const message = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
    return next(AppError.badRequest(message));
  }
  next();
};

// User validation rules
const userValidation = {
  register: [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3-50 characters')
      .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
      .matches(/\d/).withMessage('Password must contain at least one number'),
    body('fullName')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Full name cannot exceed 100 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[0-9+\-\s()]+$/).withMessage('Please provide a valid phone number'),
    body('role')
      .optional()
      .isIn(['student', 'landlord']).withMessage('Role must be either student or landlord'),
    handleValidationErrors
  ],

  login: [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required'),
    handleValidationErrors
  ],

  updateProfile: [
    body('username')
      .optional()
      .trim()
      .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3-50 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail().withMessage('Please provide a valid email'),
    body('fullName')
      .optional()
      .trim()
      .isLength({ max: 100 }).withMessage('Full name cannot exceed 100 characters'),
    body('phone')
      .optional()
      .trim()
      .matches(/^[0-9+\-\s()]*$/).withMessage('Please provide a valid phone number'),
    handleValidationErrors
  ]
};

// Accommodation validation rules
const accommodationValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3-100 characters'),
    body('address')
      .trim()
      .notEmpty().withMessage('Address is required')
      .isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),
    body('price')
      .notEmpty().withMessage('Price is required')
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    body('status')
      .optional()
      .isIn(['available', 'unavailable', 'pending']).withMessage('Invalid status'),
    handleValidationErrors
  ],

  update: [
    param('id')
      .isInt({ min: 1 }).withMessage('Invalid accommodation ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3-100 characters'),
    body('address')
      .optional()
      .trim()
      .isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    handleValidationErrors
  ],

  getById: [
    param('id')
      .isInt({ min: 1 }).withMessage('Invalid accommodation ID'),
    handleValidationErrors
  ],

  getAll: [
    query('page')
      .optional()
      .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
    handleValidationErrors
  ]
};

// Review validation rules
const reviewValidation = {
  create: [
    body('rating')
      .notEmpty().withMessage('Rating is required')
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1-5'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
    body('accommodationId')
      .notEmpty().withMessage('Accommodation ID is required')
      .isInt({ min: 1 }).withMessage('Invalid accommodation ID'),
    handleValidationErrors
  ],

  update: [
    param('id')
      .isInt({ min: 1 }).withMessage('Invalid review ID'),
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1-5'),
    body('comment')
      .optional()
      .trim()
      .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
    handleValidationErrors
  ],

  delete: [
    param('id')
      .isInt({ min: 1 }).withMessage('Invalid review ID'),
    handleValidationErrors
  ],

  getByAccommodation: [
    param('accommodationId')
      .isInt({ min: 1 }).withMessage('Invalid accommodation ID'),
    handleValidationErrors
  ]
};

// Booking validation rules (placeholder)
// Booking validation rules
const bookingValidation = {
  create: [
    body('accommodationId')
      .notEmpty().withMessage('Accommodation ID is required')
      .isInt({ min: 1 }).withMessage('Invalid accommodation ID'),
    body('checkInDate')
      .notEmpty().withMessage('Date is required')
      .isISO8601().toDate().withMessage('Invalid date format'),
    body('type')
      .optional()
      .isIn(['viewing', 'rental']).withMessage('Invalid type'),
    body('checkOutDate')
      .optional({ nullable: true })
      .isISO8601().toDate().withMessage('Invalid date'),
    body('totalPrice')
      .optional({ nullable: true })
      .isFloat({ min: 0 }),
    body('numOfPeople')
      .optional({ nullable: true })
      .isInt({ min: 1 }),
    body('phoneNumber')
      .optional()
      .trim()
      .isLength({ min: 9, max: 15 }),
    body('note')
      .optional()
      .trim()
      .isLength({ max: 500 }),
    handleValidationErrors
  ],

  updateStatus: [
    param('id').isInt({ min: 1 }).withMessage('Invalid Booking ID'),
    body('status')
      .notEmpty().withMessage('Status is required')
      .isIn(['confirmed', 'rejected', 'cancelled']).withMessage('Invalid status update'),
    handleValidationErrors
  ]
};

// Aliases for export consistency if needed, but better use standard names
const accommodationValidationRules = accommodationValidation;
const reviewValidationRules = reviewValidation;
const bookingValidationRules = bookingValidation;
const validate = handleValidationErrors;

module.exports = {
  handleValidationErrors,
  userValidation,
  accommodationValidation,
  reviewValidation,
  bookingValidation,
  // Export Aliases for backwards compatibility or desired naming
  accommodationValidationRules,
  reviewValidationRules,
  bookingValidationRules,
  validate
};
