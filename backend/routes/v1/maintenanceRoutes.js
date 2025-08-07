const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');
const { uploadMaintenance } = require('../../middleware/upload');
const maintenanceController = require('../../controllers/maintenanceController');

// Create maintenance request with image upload
router.post('/', auth, uploadMaintenance, maintenanceController.createRequest);

// Get all maintenance requests
router.get('/', auth, maintenanceController.getRequests);

// Get maintenance request by ID
router.get('/:id', auth, maintenanceController.getRequestById);

// Update maintenance request with image upload
router.put('/:id', auth, uploadMaintenance, maintenanceController.updateRequest);

// Delete maintenance request
router.delete('/:id', auth, maintenanceController.deleteRequest);

// Get maintenance statistics
router.get('/stats/overview', auth, maintenanceController.getMaintenanceStats);

module.exports = router; 