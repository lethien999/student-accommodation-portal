import axiosInstance from './axiosInstance';

const messageService = {
  getConversations: async () => {
    try {
      const response = await axiosInstance.get('/messages/conversations');
      return response.data || [];
    } catch (error) {
      console.error('Error in getConversations:', error);
      return [];
    }
  },

  getMessages: async (conversationId) => {
    try {
      const response = await axiosInstance.get(`/messages/${conversationId}/messages`);
      return response.data || [];
    } catch (error) {
      console.error('Error in getMessages:', error);
      return [];
    }
  },

  sendMessage: async (data) => {
    try {
      // data can be { receiverId, content } or { conversationId, content }
      const response = await axiosInstance.post('/messages', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await axiosInstance.get('/messages/unread-count');
      return response.data.unreadCount || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  },
};

export default messageService; 