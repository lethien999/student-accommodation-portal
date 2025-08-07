const { Message, User, Conversation } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database'); // Added missing import for sequelize

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: userId },
          { senderId: userId, receiverId: currentUserId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Mark unread messages as read
    await Message.update(
      { isRead: true },
      {
        where: {
          senderId: userId,
          receiverId: currentUserId,
          isRead: false
        }
      }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Error getting conversation' });
  }
};

// @desc    Get unread message count for current user
// @route   GET /api/messages/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    // Đếm số tin nhắn chưa đọc mà user là người nhận
    const unreadCount = await Message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });
    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread message count:', error);
    res.status(500).json({ message: 'Lỗi khi lấy số lượng tin nhắn chưa đọc' });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [
          { user1Id: req.user.id },
          { user2Id: req.user.id }
        ]
      },
      include: [
        { model: User, as: 'user1', attributes: ['id', 'username', 'avatar'] },
        { model: User, as: 'user2', attributes: ['id', 'username', 'avatar'] },
        { 
          model: Message, 
          as: 'lastMessage',
          attributes: ['id', 'content', 'createdAt']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Lấy số lượng tin nhắn chưa đọc cho từng cuộc trò chuyện
    const conversationIds = conversations.map(conv => conv.id);
    const unreadCounts = await Message.findAll({
      attributes: ['conversationId', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: {
        conversationId: conversationIds,
        receiverId: req.user.id,
        isRead: false
      },
      group: ['conversationId']
    });
    const unreadMap = {};
    unreadCounts.forEach(row => {
      unreadMap[row.conversationId] = parseInt(row.dataValues.count, 10);
    });

    // Format data for frontend
    const formattedConversations = conversations.map(conv => {
      const isUser1 = conv.user1Id === req.user.id;
      const participant = isUser1 ? conv.user2 : conv.user1;
      return {
        id: conv.id,
        participant: {
          id: participant.id,
          username: participant.username,
          avatar: participant.avatar
        },
        lastMessage: conv.lastMessage?.content || 'Chưa có tin nhắn',
        updatedAt: conv.updatedAt,
        unreadCount: unreadMap[conv.id] || 0
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách trò chuyện' });
  }
};

// @desc    Get messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const conversation = await Conversation.findByPk(conversationId, {
      include: [
        { model: User, as: 'user1', attributes: ['id', 'username', 'avatar'] },
        { model: User, as: 'user2', attributes: ['id', 'username', 'avatar'] }
      ]
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Cuộc trò chuyện không tồn tại' });
    }

    // Kiểm tra user có thuộc cuộc trò chuyện này không
    if (conversation.user1Id !== req.user.id && conversation.user2Id !== req.user.id) {
      return res.status(403).json({ error: 'Không có quyền truy cập' });
    }

    const messages = await Message.findAll({
      where: { conversationId },
      include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'avatar'] }],
      order: [['createdAt', 'ASC']]
    });

    res.json({ conversation, messages });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy tin nhắn' });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, content } = req.body;
    let convId = conversationId;

    // Nếu không có conversationId, tạo mới
    if (!convId) {
      const conversation = await Conversation.findOrCreate({
        where: {
          [Op.or]: [
            { user1Id: req.user.id, user2Id: receiverId },
            { user1Id: receiverId, user2Id: req.user.id }
          ]
        },
        defaults: {
          user1Id: req.user.id,
          user2Id: receiverId
        }
      });
      convId = conversation[0].id;
    }

    const message = await Message.create({
      conversationId: convId,
      senderId: req.user.id,
      content
    });

    // Cập nhật lastMessage và thời gian updatedAt của conversation
    await Conversation.update({ 
      lastMessageId: message.id,
      updatedAt: new Date()
    }, { where: { id: convId } });
    
    // Gửi tin nhắn real-time qua Socket.IO
    const fullMessage = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'avatar']
      }]
    });

    req.io.to(convId).emit('newMessage', fullMessage);

    res.status(201).json(fullMessage);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi gửi tin nhắn' });
  }
}; 