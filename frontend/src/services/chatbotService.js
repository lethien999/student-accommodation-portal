import axiosInstance from './axiosInstance';

const chatbotService = {
  // Get all training data
  getTrainingData: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/chatbot/training', { params });
      return response.data || { trainingData: [] };
    } catch (error) {
      console.error('Error in getTrainingData:', error);
      return { trainingData: [] };
    }
  },

  // Get training data by ID
  getTrainingDataById: async (id) => {
    const response = await axiosInstance.get(`/chatbot/training/${id}`);
    return response.data;
  },

  // Create new training data
  createTrainingData: async (trainingData) => {
    const response = await axiosInstance.post('/chatbot/training', trainingData);
    return response.data;
  },

  // Update training data
  updateTrainingData: async (id, trainingData) => {
    const response = await axiosInstance.put(`/chatbot/training/${id}`, trainingData);
    return response.data;
  },

  // Delete training data
  deleteTrainingData: async (id) => {
    const response = await axiosInstance.delete(`/chatbot/training/${id}`);
    return response.data;
  },

  // Toggle training data status
  toggleTrainingDataStatus: async (id) => {
    const response = await axiosInstance.put(`/chatbot/training/${id}/toggle`);
    return response.data;
  },

  // Get all conversations
  getConversations: async (params = {}) => {
    try {
      const response = await axiosInstance.get('/chatbot/conversations', { params });
      return response.data || { conversations: [] };
    } catch (error) {
      console.error('Error in getConversations:', error);
      return { conversations: [] };
    }
  },

  // Get conversation by ID
  getConversationById: async (id) => {
    const response = await axiosInstance.get(`/chatbot/conversations/${id}`);
    return response.data;
  },

  // Get chatbot analytics
  getChatbotAnalytics: async (params = {}) => {
    const response = await axiosInstance.get('/chatbot/analytics', { params });
    return response.data;
  },

  // Gửi message tới chatbot thực tế
  sendMessage: async ({ message, conversationId }) => {
    const response = await axiosInstance.post('/chatbot/chat', { message, conversationId });
    return {
      reply: response.data.answer,
      conversationId: response.data.conversationId,
      botMessage: response.data.botMessage,
      matchedScore: response.data.matchedScore,
      matchedQuestion: response.data.matchedQuestion
    };
  },

  // Lấy lịch sử chat (mock, có thể mở rộng lấy từ conversationId)
  getChatHistory: async () => {
    // TODO: Gọi API thực tế nếu cần
    return { messages: [] };
  },

  // Lấy/lưu cài đặt chatbot (mock)
  getSettings: async () => {
    return {
      language: 'vi',
      responseSpeed: 'normal',
      personality: 'friendly'
    };
  },
  updateSettings: async (settings) => {
    // TODO: Gọi API lưu settings nếu cần
    return settings;
  },
};

export default chatbotService; 