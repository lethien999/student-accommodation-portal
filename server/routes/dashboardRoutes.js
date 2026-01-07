const express = require('express');
const router = express.Router();
const {
    getAdminDashboard,
    getLandlordDashboard,
    getSaleDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Dashboards
 *   description: Role-based dashboard statistics
 */

/**
 * @swagger
 * /dashboard/admin:
 *   get:
 *     summary: Get admin dashboard stats
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin stats retrieved
 *       403:
 *         description: Forbidden
 */
router.get('/admin', protect, authorize('admin'), getAdminDashboard);

/**
 * @swagger
 * /dashboard/landlord:
 *   get:
 *     summary: Get landlord dashboard stats
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Landlord stats retrieved
 */
router.get('/landlord', protect, authorize('landlord', 'admin'), getLandlordDashboard);

/**
 * @swagger
 * /dashboard/sale:
 *   get:
 *     summary: Get sale dashboard stats
 *     tags: [Dashboards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sale stats retrieved
 */
router.get('/sale', protect, authorize('sale', 'admin'), getSaleDashboard);

module.exports = router;
