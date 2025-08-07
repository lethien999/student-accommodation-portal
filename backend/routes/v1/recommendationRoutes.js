const express = require('express');
const router = express.Router();
const { postRecommendationFeedback } = require('../../controllers/recommendationController');
const { auth } = require('../../middleware/auth');

router.post('/feedback', auth, postRecommendationFeedback); 

module.exports = router; 