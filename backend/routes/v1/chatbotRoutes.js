const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/auth');
const checkPermission = require('../../middleware/checkPermission');
const chatbotController = require('../../controllers/chatbotController');

// Training data routes
router.get('/training', auth, checkPermission('chatbot:read'), chatbotController.getTrainingData);
router.get('/training/:id', auth, checkPermission('chatbot:read'), chatbotController.getTrainingDataById);
router.post('/training', auth, checkPermission('chatbot:create'), chatbotController.createTrainingData);
router.put('/training/:id', auth, checkPermission('chatbot:update'), chatbotController.updateTrainingData);
router.delete('/training/:id', auth, checkPermission('chatbot:delete'), chatbotController.deleteTrainingData);
router.put('/training/:id/toggle', auth, checkPermission('chatbot:update'), chatbotController.toggleTrainingDataStatus);

// Conversation routes
router.get('/conversations', auth, checkPermission('chatbot:read'), chatbotController.getConversations);
router.get('/conversations/:id', auth, checkPermission('chatbot:read'), chatbotController.getConversationById);

// Analytics routes
router.get('/analytics', auth, checkPermission('chatbot:read'), chatbotController.getChatbotAnalytics);
router.post('/chat', auth, chatbotController.chat);

module.exports = router; 