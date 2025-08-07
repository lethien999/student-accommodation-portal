const { ChatbotTrainingData, User, Conversation, Message } = require('../models');
const { Op } = require('sequelize');
const stringSimilarity = require('string-similarity');

// Get all training data with pagination and filters
const getTrainingData = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, isActive } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (category) whereClause.category = category;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const trainingData = await ChatbotTrainingData.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      trainingData: trainingData.rows,
      total: trainingData.count,
      totalPages: Math.ceil(trainingData.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching training data:', error);
    res.status(500).json({ message: 'Lỗi khi tải dữ liệu training' });
  }
};

// Get training data by ID
const getTrainingDataById = async (req, res) => {
  try {
    const { id } = req.params;
    const trainingData = await ChatbotTrainingData.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    if (!trainingData) {
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu training' });
    }

    res.json(trainingData);
  } catch (error) {
    console.error('Error fetching training data:', error);
    res.status(500).json({ message: 'Lỗi khi tải dữ liệu training' });
  }
};

// Create new training data
const createTrainingData = async (req, res) => {
  try {
    const trainingData = {
      ...req.body,
      createdBy: req.user.id
    };

    const newTrainingData = await ChatbotTrainingData.create(trainingData);
    res.status(201).json(newTrainingData);
  } catch (error) {
    console.error('Error creating training data:', error);
    res.status(500).json({ message: 'Lỗi khi tạo dữ liệu training' });
  }
};

// Update training data
const updateTrainingData = async (req, res) => {
  try {
    const { id } = req.params;
    const trainingData = await ChatbotTrainingData.findByPk(id);

    if (!trainingData) {
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu training' });
    }

    await trainingData.update(req.body);
    res.json(trainingData);
  } catch (error) {
    console.error('Error updating training data:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật dữ liệu training' });
  }
};

// Delete training data
const deleteTrainingData = async (req, res) => {
  try {
    const { id } = req.params;
    const trainingData = await ChatbotTrainingData.findByPk(id);

    if (!trainingData) {
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu training' });
    }

    await trainingData.destroy();
    res.json({ message: 'Xóa dữ liệu training thành công' });
  } catch (error) {
    console.error('Error deleting training data:', error);
    res.status(500).json({ message: 'Lỗi khi xóa dữ liệu training' });
  }
};

// Toggle training data active status
const toggleTrainingDataStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const trainingData = await ChatbotTrainingData.findByPk(id);

    if (!trainingData) {
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu training' });
    }

    await trainingData.update({ isActive: !trainingData.isActive });
    res.json(trainingData);
  } catch (error) {
    console.error('Error toggling training data status:', error);
    res.status(500).json({ message: 'Lỗi khi thay đổi trạng thái dữ liệu training' });
  }
};

// Get conversations with pagination and filters
const getConversations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;

    const conversations = await Conversation.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      conversations: conversations.rows,
      total: conversations.count,
      totalPages: Math.ceil(conversations.count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Lỗi khi tải danh sách cuộc hội thoại' });
  }
};

// Get conversation by ID with messages
const getConversationById = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email']
        },
        {
          model: Message,
          as: 'messages',
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Không tìm thấy cuộc hội thoại' });
    }

    res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ message: 'Lỗi khi tải cuộc hội thoại' });
  }
};

// Get chatbot analytics
const getChatbotAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const whereClause = {};
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Get conversation statistics
    const totalConversations = await Conversation.count({ where: whereClause });
    const activeConversations = await Conversation.count({ 
      where: { ...whereClause, status: 'active' } 
    });

    // Get average satisfaction
    const satisfactionStats = await Conversation.findAll({
      where: { ...whereClause, satisfaction: { [Op.ne]: null } },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('satisfaction')), 'averageSatisfaction']
      ]
    });

    const averageSatisfaction = satisfactionStats[0]?.dataValues?.averageSatisfaction || 0;

    // Get category distribution
    const categoryStats = await Conversation.findAll({
      where: whereClause,
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category']
    });

    // Get daily statistics for the last 7 days
    const dailyStats = await Conversation.findAll({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'conversations'],
        [sequelize.fn('AVG', sequelize.col('satisfaction')), 'satisfaction']
      ],
      group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']]
    });

    res.json({
      totalConversations,
      activeConversations,
      averageSatisfaction: parseFloat(averageSatisfaction).toFixed(1),
      categories: categoryStats,
      dailyStats
    });
  } catch (error) {
    console.error('Error fetching chatbot analytics:', error);
    res.status(500).json({ message: 'Lỗi khi tải thống kê chatbot' });
  }
};

// Xử lý chat thực tế
const chat = async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Thiếu nội dung tin nhắn' });
    }

    // 1. Tìm câu trả lời phù hợp nhất từ training data
    const allData = await ChatbotTrainingData.findAll({ where: { isActive: true } });
    let bestMatch = null;
    let bestScore = 0;
    for (const data of allData) {
      const score = stringSimilarity.compareTwoStrings(message.toLowerCase(), data.question.toLowerCase());
      if (score > bestScore) {
        bestScore = score;
        bestMatch = data;
      }
    }

    let answer = '';
    if (bestScore > 0.7) {
      answer = bestMatch.answer;
      // Tăng usageCount
      await bestMatch.increment('usageCount');
    } else {
      // Fallback: trả lời mặc định
      answer = 'Xin lỗi, tôi chưa hiểu câu hỏi của bạn. Bạn có thể hỏi lại hoặc liên hệ hỗ trợ.';
    }

    // 2. Lưu lịch sử chat (Conversation/Message)
    let conversation = null;
    if (conversationId) {
      conversation = await Conversation.findByPk(conversationId);
    }
    if (!conversation) {
      conversation = await Conversation.create({
        userId: req.user.id,
        status: 'active',
        category: bestMatch?.category || 'general'
      });
    }
    // Lưu message user
    await Message.create({
      conversationId: conversation.id,
      senderId: req.user.id,
      content: message,
      type: 'user'
    });
    // Lưu message bot
    const botMsg = await Message.create({
      conversationId: conversation.id,
      senderId: null,
      content: answer,
      type: 'bot'
    });

    res.json({
      answer,
      conversationId: conversation.id,
      botMessage: botMsg,
      matchedScore: bestScore,
      matchedQuestion: bestMatch?.question || null
    });
  } catch (error) {
    console.error('Error in chatbot chat:', error);
    res.status(500).json({ message: 'Lỗi khi xử lý chatbot' });
  }
};

module.exports = {
  getTrainingData,
  getTrainingDataById,
  createTrainingData,
  updateTrainingData,
  deleteTrainingData,
  toggleTrainingDataStatus,
  getConversations,
  getConversationById,
  getChatbotAnalytics,
  chat
}; 