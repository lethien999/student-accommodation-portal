/**
 * Revenue Routes
 * 
 * API routes for revenue analytics and reporting.
 * 
 * @module routes/v1/revenueRoutes
 */
const express = require('express');
const router = express.Router();
const revenueController = require('../../controllers/revenueController');
const { protect, authorize } = require('../../middleware/auth');

// All routes require authentication
router.use(protect);

/**
 * Tenant routes
 */
router.get('/my-payments', revenueController.getMyPayments);

/**
 * Landlord/Admin routes
 */

/**
 * @route GET /api/v1/revenue/summary
 * @desc Get revenue summary
 * @access Landlord, Admin
 */
router.get('/summary', authorize('landlord', 'admin'), revenueController.getRevenueSummary);

/**
 * @route GET /api/v1/revenue/trend
 * @desc Get monthly revenue trend
 * @access Landlord, Admin
 */
router.get('/trend', authorize('landlord', 'admin'), revenueController.getMonthlyTrend);

/**
 * @route GET /api/v1/revenue/by-property
 * @desc Get revenue breakdown by property
 * @access Landlord, Admin
 */
router.get('/by-property', authorize('landlord', 'admin'), revenueController.getRevenueByProperty);

/**
 * @route GET /api/v1/revenue/debts
 * @desc Get debt report
 * @access Landlord, Admin
 */
router.get('/debts', authorize('landlord', 'admin'), revenueController.getDebtReport);

/**
 * @route GET /api/v1/revenue/income-statement
 * @desc Get income statement
 * @access Landlord, Admin
 */
router.get('/income-statement', authorize('landlord', 'admin'), revenueController.getIncomeStatement);

/**
 * @route GET /api/v1/revenue/occupancy
 * @desc Get occupancy statistics
 * @access Landlord, Admin
 */
router.get('/occupancy', authorize('landlord', 'admin'), revenueController.getOccupancyStats);

/**
 * @route GET /api/v1/revenue/export/pdf
 * @desc Export PDF report
 * @access Landlord, Admin
 */
router.get('/export/pdf', authorize('landlord', 'admin'), revenueController.exportPDF);

/**
 * @route GET /api/v1/revenue/export/csv
 * @desc Export CSV data
 * @access Landlord, Admin
 */
router.get('/export/csv', authorize('landlord', 'admin'), revenueController.exportCSV);

module.exports = router;
