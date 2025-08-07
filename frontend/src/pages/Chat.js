import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Form, Button, InputGroup, Spinner, Alert, Image } from 'react-bootstrap';
import messageService from '../services/messageService';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { io } from 'socket.io-client';
import './Chat.css';

const Chat = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    // Kết nối Socket.IO
    socket.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

    socket.current.on('connect', () => {
      console.log('Socket connected!');
      socket.current.emit('joinConversation', conversationId);
    });

    socket.current.on('newMessage', (message) => {
      // Chỉ thêm tin nhắn nếu nó thuộc về cuộc trò chuyện hiện tại
      if (message.conversationId === parseInt(conversationId)) {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    });

    // Dọn dẹp khi component unmount
    return () => {
      socket.current.disconnect();
    };
  }, [conversationId]);
  
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await messageService.getMessages(conversationId);
        setMessages(data.messages || []);
        setConversation(data.conversation || null);
      } catch (err) {
        setError('Lỗi khi tải tin nhắn.');
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    // Tự động cuộn xuống tin nhắn mới nhất
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messageData = {
      conversationId: parseInt(conversationId),
      content: newMessage.trim(),
    };
    
    try {
      const sentMessage = await messageService.sendMessage(messageData);
      // Gửi tin nhắn qua socket để client khác nhận được
      socket.current.emit('sendMessage', sentMessage);
      setMessages((prevMessages) => [...prevMessages, sentMessage]);
      setNewMessage('');
    } catch (err) {
      setError('Lỗi khi gửi tin nhắn.');
    }
  };
  
  const otherUser = conversation 
    ? (conversation.user1.id === user.id ? conversation.user2 : conversation.user1) 
    : null;

  return (
    <>
      <Helmet>
        <title>Trò chuyện với {otherUser?.username || '...'} - Student Accommodation Portal</title>
      </Helmet>
      <Container className="chat-container mt-4">
        <Card>
          <Card.Header className="d-flex align-items-center">
            {otherUser ? (
              <>
                <Link to="/messages" className="me-3 text-dark">←</Link>
                <Image src={otherUser.avatar || `https://i.pravatar.cc/150?u=${otherUser.id}`} roundedCircle width={40} height={40} />
                <h5 className="mb-0 ms-3">{otherUser.username}</h5>
              </>
            ) : (
              <Spinner animation="border" size="sm" />
            )}
          </Card.Header>
          <Card.Body className="chat-body">
            {loading && <div className="text-center"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && messages.map((msg) => (
              <div
                key={msg.id}
                className={`d-flex mb-3 ${msg.senderId === user.id ? 'justify-content-end' : 'justify-content-start'}`}
              >
                <div className={`message-bubble ${msg.senderId === user.id ? 'sent' : 'received'}`}>
                  {msg.content}
                  <div className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </Card.Body>
          <Card.Footer>
            <Form onSubmit={handleSendMessage}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" variant="primary" disabled={!newMessage.trim()}>
                  Gửi
                </Button>
              </InputGroup>
            </Form>
          </Card.Footer>
        </Card>
      </Container>
    </>
  );
};

export default Chat; 