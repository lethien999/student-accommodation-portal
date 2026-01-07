const express = require('express');
const router = express.Router();
const {
  getAll,
  getById,
  create,
  update,
  remove
} = require('../controllers/accommodationController');
const { protect } = require('../middleware/auth');
const { accommodationValidation } = require('../middleware/validator');

/**
 * @swagger
 * tags:
 *   name: Accommodations
 *   description: Accommodation management API
 */

/**
 * @swagger
 * /accommodations:
 *   get:
 *     summary: Get all accommodations with filters
 *     tags: [Accommodations]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, address, description
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, unavailable, pending]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of accommodations
 */
router.get('/', accommodationValidation.getAll, getAll);

/**
 * @swagger
 * /accommodations/{id}:
 *   get:
 *     summary: Get accommodation by ID
 *     tags: [Accommodations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Accommodation details
 *       404:
 *         description: Not found
 */
router.get('/:id', accommodationValidation.getById, getById);

/**
 * @swagger
 * /accommodations:
 *   post:
 *     summary: Create new accommodation
 *     tags: [Accommodations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - price
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       201:
 *         description: Accommodation created
 */
router.post('/', protect, accommodationValidation.create, create);

/**
 * @swagger
 * /accommodations/{id}:
 *   put:
 *     summary: Update accommodation
 *     tags: [Accommodations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Accommodation updated
 */
router.put('/:id', protect, accommodationValidation.update, update);

/**
 * @swagger
 * /accommodations/{id}:
 *   delete:
 *     summary: Delete accommodation
 *     tags: [Accommodations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Accommodation deleted
 */
router.delete('/:id', protect, remove);

module.exports = router;
