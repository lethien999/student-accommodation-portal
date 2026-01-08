const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

router.route('/')
    .post(authorize('sale', 'admin'), verificationController.createReport)
    .get(authorize('sale', 'admin'), verificationController.getAllReports);

router.put('/:id/approve', authorize('admin'), verificationController.approveReport);
router.put('/:id/reject', authorize('admin'), verificationController.rejectReport);

module.exports = router;
