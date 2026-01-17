/**
 * Property Routes
 * 
 * API routes for multi-property management.
 * 
 * @module routes/v1/propertyRoutes
 */
const express = require('express');
const router = express.Router();
const propertyController = require('../../controllers/propertyController');
const { protect, authorize } = require('../../middleware/auth');

// All routes require authentication
router.use(protect);

// Only landlords can access these routes
router.use(authorize('landlord', 'admin'));

/**
 * @route GET /api/v1/properties
 * @desc Get all properties for current landlord
 * @access Landlord, Admin
 */
router.get('/', propertyController.getMyProperties);

/**
 * @route GET /api/v1/properties/stats/overview
 * @desc Get property statistics overview
 * @access Landlord, Admin
 */
router.get('/stats/overview', propertyController.getPropertyStats);

/**
 * @route GET /api/v1/properties/:id
 * @desc Get single property by ID
 * @access Landlord, Admin
 */
router.get('/:id', propertyController.getPropertyById);

/**
 * @route POST /api/v1/properties
 * @desc Create new property
 * @access Landlord, Admin
 */
router.post('/', propertyController.createProperty);

/**
 * @route PUT /api/v1/properties/:id
 * @desc Update property
 * @access Landlord, Admin
 */
router.put('/:id', propertyController.updateProperty);

/**
 * @route DELETE /api/v1/properties/:id
 * @desc Delete property
 * @access Landlord, Admin
 */
router.delete('/:id', propertyController.deleteProperty);

/**
 * @route POST /api/v1/properties/:id/accommodations/:accommodationId
 * @desc Assign accommodation to property
 * @access Landlord, Admin
 */
router.post('/:id/accommodations/:accommodationId', propertyController.assignAccommodation);

/**
 * @route DELETE /api/v1/properties/:id/accommodations/:accommodationId
 * @desc Remove accommodation from property
 * @access Landlord, Admin
 */
router.delete('/:id/accommodations/:accommodationId', propertyController.removeAccommodation);

module.exports = router;
