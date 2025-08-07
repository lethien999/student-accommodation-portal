import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, Paper, CircularProgress, Alert, Avatar } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import io from 'socket.io-client';
import api from '../services/api'; // Use the configured axios instance
import { useAuth } from '../contexts/AuthContext';

const Chat = ({ receiverId, receiverName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user) return; // Ensure user is logged in

    // Initialize Socket.IO connection
    // Ensure the CLIENT_URL from .env is used or a default is provided
    const SOCKET_SERVER_URL = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:5000';
    socketRef.current = io(SOCKET_SERVER_URL, {
      query: { token: localStorage.getItem('token') } // Send token for authentication
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to Socket.IO');
      // Join a room for the conversation between user and receiver
      socketRef.current.emit('joinRoom', { userId1: user.id, userId2: receiverId });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Disconnected from Socket.IO');
    });

    socketRef.current.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user, receiverId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !receiverId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/messages/${receiverId}`); // Fetch messages for this conversation
        setMessages(response.data);
      } catch (err) {
        setError('Error fetching messages.');
        console.error('Error fetching messages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !user || !receiverId) return;

    const messageData = {
      receiverId: receiverId,
      content: newMessage,
    };

    try {
      // Send message via API first (for persistence)
      const response = await api.post('/messages', messageData);
      const sentMessage = response.data; // Assuming API returns the created message

      // Emit message via socket (for real-time delivery to other user)
      socketRef.current.emit('sendMessage', sentMessage);

      setNewMessage('');
      // Optimistically update UI or re-fetch messages after API success
      // For now, we rely on the socket to update the UI
    } catch (err) {
      setError('Error sending message.');
      console.error('Error sending message:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '600px' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>Chat with {receiverName}</Typography>
      <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
        {messages.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center">
            Start a conversation!
          </Typography>
        ) : (
          messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.senderId === user.id ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: message.senderId === user.id ? 'row-reverse' : 'row',
                  gap: 1,
                  maxWidth: '70%',
                }}
              >
                <Avatar sx={{ bgcolor: message.senderId === user.id ? 'primary.main' : 'secondary.main' }}>
                  {message.sender?.username ? message.sender.username[0].toUpperCase() : '?'}
                </Avatar>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    bgcolor: message.senderId === user.id ? '#e3f2fd' : '#f5f5f5',
                    borderRadius: 2,
                    borderTopLeftRadius: message.senderId === user.id ? 2 : 0,
                    borderTopRightRadius: message.senderId === user.id ? 0 : 2,
                  }}
                >
                  <Typography variant="body2">{message.content}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: message.senderId === user.id ? 'right' : 'left', mt: 0.5 }}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>
      <form onSubmit={handleSendMessage} sx={{ display: 'flex' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          sx={{ mr: 1 }}
          size="small"
        />
        <Button
          type="submit"
          variant="contained"
          endIcon={<SendIcon />}
          disabled={!newMessage.trim()}
        >
          Send
        </Button>
      </form>
    </Paper>
  );
};

export default Chat; 