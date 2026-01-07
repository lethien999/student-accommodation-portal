const express = require('express');
const router = express.Router();
const { uploadImage, uploadImages } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Uploads
 *   description: File upload API
 */

/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: Upload a single image
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *           default: temp
 *         description: Folder to store image (e.g., accommodations, avatars)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 url:
 *                   type: string
 */
router.post('/image', protect, uploadImage);

/**
 * @swagger
 * /upload/images:
 *   post:
 *     summary: Upload multiple images
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema:
 *           type: string
 *           default: temp
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Images uploaded successfully
 */
router.post('/images', protect, uploadImages);

module.exports = router;
