const express = require('express');
const router = express.Router();
const {
    getReviews,
    createReview,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { reviewValidation } = require('../middleware/validator');

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management API
 */

/**
 * @swagger
 * /reviews/{accommodationId}:
 *   get:
 *     summary: Get reviews for an accommodation
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: accommodationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of reviews
 */
router.get('/:accommodationId', reviewValidation.getByAccommodation, getReviews);

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Create a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - accommodationId
 *               - rating
 *             properties:
 *               accommodationId:
 *                 type: integer
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 */
router.post('/', protect, reviewValidation.create, createReview);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     tags: [Reviews]
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
 *         description: Review deleted
 */
router.delete('/:id', protect, reviewValidation.delete, deleteReview);

module.exports = router;
