const express = require('express');
const router = express.Router();
const savedController = require('../controllers/savedController');
const { protect } = require('../middleware/auth');

router.use(protect); // Require login

router.post('/toggle', savedController.toggleSave);
router.get('/', savedController.getSavedList);
router.get('/check/:accommodationId', savedController.checkStatus);

module.exports = router;
