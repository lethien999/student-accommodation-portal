import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaRobot, FaUser, FaPaperPlane, FaMicrophone, FaTimes, FaCog } from 'react-icons/fa';
import chatbotService from '../services/chatbotService';
import { useAuth } from '../contexts/AuthContext';
import './Chatbot.css';

const Chatbot = ({ isOpen, onClose, onToggle }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [chatbotSettings, setChatbotSettings] = useState({
    language: 'vi',
    responseSpeed: 'normal',
    personality: 'friendly'
  });
  const [conversationId, setConversationId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history
  useEffect(() => {
    if (isOpen && user) {
      loadChatHistory();
    }
  }, [isOpen, user]);

  // Load chatbot settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await chatbotService.getSettings();
        setChatbotSettings(settings);
      } catch (error) {
        console.error('Error loading chatbot settings:', error);
      }
    };

    loadSettings();
  }, []);

  const loadChatHistory = async () => {
    try {
      // TODO: Gọi API lấy lịch sử chat theo conversationId nếu cần
      setMessages([]);
      addWelcomeMessage();
    } catch (error) {
      console.error('Error loading chat history:', error);
      if (messages.length === 0) {
        addWelcomeMessage();
      }
    }
  };

  const addWelcomeMessage = () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'bot',
      content: 'Xin chào! Tôi là trợ lý AI của hệ thống nhà trọ sinh viên. Tôi có thể giúp bạn:\n\n• Tìm kiếm nhà trọ phù hợp\n• Hướng dẫn đặt phòng\n• Giải đáp thắc mắc về thanh toán\n• Hỗ trợ kỹ thuật\n\nBạn có thể hỏi tôi bất cứ điều gì!',
      timestamp: new Date().toISOString(),
      suggestions: [
        'Tìm nhà trọ gần trường',
        'Hướng dẫn đặt phòng',
        'Thông tin thanh toán',
        'Liên hệ hỗ trợ'
      ]
    };
    setMessages([welcomeMessage]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setError('');

    try {
      const response = await chatbotService.sendMessage({
        message: inputMessage,
        conversationId
      });
      setConversationId(response.conversationId);
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.reply,
        timestamp: new Date().toISOString(),
        confidence: response.matchedScore,
        matchedQuestion: response.matchedQuestion
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại.');
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'vi-VN';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsTyping(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsTyping(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsTyping(false);
      };
      
      recognition.start();
    } else {
      setError('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói.');
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      await chatbotService.updateSettings(newSettings);
      setChatbotSettings(newSettings);
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating chatbot settings:', error);
    }
  };

  const clearChat = () => {
    setMessages([]);
    addWelcomeMessage();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'danger';
  };

  if (!isOpen) {
    return (
      <div className="chatbot-toggle" onClick={onToggle}>
        <Button variant="primary" size="lg" className="rounded-circle">
          <FaRobot size={24} />
        </Button>
      </div>
    );
  }

  return (
    <div className="chatbot-container">
      <Card className="chatbot-card">
        {/* Header */}
        <Card.Header className="chatbot-header">
          <div className="d-flex align-items-center">
            <FaRobot className="me-2" />
            <div>
              <h6 className="mb-0">Trợ lý AI</h6>
              <small className="text-muted">Sẵn sàng hỗ trợ</small>
            </div>
          </div>
          <div className="d-flex gap-1">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <FaCog />
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              <FaTimes />
            </Button>
          </div>
        </Card.Header>

        {!isMinimized && (
          <>
            {/* Messages */}
            <Card.Body className="chatbot-body">
              <div className="messages-container">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.type} ${message.isError ? 'error' : ''}`}
                  >
                    <div className="message-avatar">
                      {message.type === 'bot' ? (
                        <FaRobot className="text-primary" />
                      ) : (
                        <FaUser className="text-secondary" />
                      )}
                    </div>
                    <div className="message-content">
                      <div className="message-text">
                        {message.content}
                      </div>
                      <div className="message-meta">
                        <small className="text-muted">
                          {formatTime(message.timestamp)}
                        </small>
                        {message.confidence && (
                          <Badge 
                            bg={getConfidenceColor(message.confidence)}
                            className="ms-2"
                          >
                            {Math.round(message.confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="message-suggestions">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline-primary"
                              size="sm"
                              className="me-2 mb-1"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="message bot">
                    <div className="message-avatar">
                      <FaRobot className="text-primary" />
                    </div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <Spinner animation="border" size="sm" className="me-2" />
                        <span>Đang nhập...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </Card.Body>

            {/* Error Display */}
            {error && (
              <Alert variant="danger" className="m-2" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            )}

            {/* Input */}
            <Card.Footer className="chatbot-footer">
              <Form onSubmit={handleSendMessage}>
                <div className="d-flex gap-2">
                  <Form.Control
                    ref={inputRef}
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    disabled={isTyping}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={handleVoiceInput}
                    disabled={isTyping}
                  >
                    <FaMicrophone />
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!inputMessage.trim() || isTyping}
                  >
                    <FaPaperPlane />
                  </Button>
                </div>
              </Form>
            </Card.Footer>
          </>
        )}
      </Card>

      {/* Settings Modal */}
      {showSettings && (
        <div className="chatbot-settings-overlay">
          <Card className="chatbot-settings">
            <Card.Header>
              <h6 className="mb-0">Cài đặt chatbot</h6>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Ngôn ngữ</Form.Label>
                <Form.Select
                  value={chatbotSettings.language}
                  onChange={(e) => setChatbotSettings(prev => ({
                    ...prev,
                    language: e.target.value
                  }))}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Tốc độ phản hồi</Form.Label>
                <Form.Select
                  value={chatbotSettings.responseSpeed}
                  onChange={(e) => setChatbotSettings(prev => ({
                    ...prev,
                    responseSpeed: e.target.value
                  }))}
                >
                  <option value="fast">Nhanh</option>
                  <option value="normal">Bình thường</option>
                  <option value="slow">Chậm</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Tính cách</Form.Label>
                <Form.Select
                  value={chatbotSettings.personality}
                  onChange={(e) => setChatbotSettings(prev => ({
                    ...prev,
                    personality: e.target.value
                  }))}
                >
                  <option value="friendly">Thân thiện</option>
                  <option value="professional">Chuyên nghiệp</option>
                  <option value="casual">Thoải mái</option>
                </Form.Select>
              </Form.Group>
            </Card.Body>
            <Card.Footer>
              <div className="d-flex gap-2">
                <Button variant="secondary" onClick={() => setShowSettings(false)}>
                  Hủy
                </Button>
                <Button variant="primary" onClick={() => updateSettings(chatbotSettings)}>
                  Lưu cài đặt
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Chatbot; 