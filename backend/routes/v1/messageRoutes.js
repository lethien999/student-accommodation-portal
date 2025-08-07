const express = require('express');
const router = express.Router();
const messageController = require('../../controllers/messageController');
const { auth } = require('../../middleware/auth');
const { getUnreadCount } = require('../../controllers/messageController');

// Lấy danh sách cuộc trò chuyện
router.get('/conversations', auth, messageController.getConversations);

// Lấy tin nhắn trong một cuộc trò chuyện
router.get('/:conversationId/messages', auth, messageController.getMessages);

// Gửi tin nhắn
router.post('/', auth, messageController.sendMessage);

router.get('/unread-count', auth, getUnreadCount);

module.exports = router; 