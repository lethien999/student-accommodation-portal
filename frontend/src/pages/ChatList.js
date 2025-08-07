import React, { useState, useEffect } from 'react';
import { Container, ListGroup, Spinner, Alert, Image, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import messageService from '../services/messageService';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

const ChatList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await messageService.getConversations();
        setConversations(data || []);
      } catch (err) {
        setError('Lỗi khi tải danh sách trò chuyện.');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const getOtherUser = (conversation) => {
    return conversation.user1Id === user.id ? conversation.user2 : conversation.user1;
  };

  return (
    <>
      <Helmet>
        <title>Tin nhắn - Student Accommodation Portal</title>
      </Helmet>
      <Container className="mt-4">
        <h2 className="mb-4">Hộp thư</h2>
        {loading && <Spinner animation="border" />}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loading && !error && (
          <ListGroup>
            {conversations.length > 0 ? (
              conversations.map((conv) => {
                const otherUser = getOtherUser(conv);
                return (
                  <ListGroup.Item
                    as={Link}
                    to={`/chat/${conv.id}`}
                    key={conv.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div className="d-flex align-items-center">
                      <Image
                        src={otherUser.avatar || `https://i.pravatar.cc/150?u=${otherUser.id}`}
                        roundedCircle
                        width={50}
                        height={50}
                        className="me-3"
                      />
                      <div>
                        <h6 className="mb-0">{otherUser.username}</h6>
                        <p className="mb-0 text-muted small">
                          {conv.lastMessage || 'Chưa có tin nhắn nào.'}
                        </p>
                      </div>
                    </div>
                    <div className="d-flex flex-column align-items-end">
                      <small className="text-muted">
                        {conv.updatedAt && new Date(conv.updatedAt).toLocaleTimeString('vi-VN')}
                      </small>
                      {conv.unreadCount > 0 && (
                        <Badge bg="danger" pill className="ms-2 mt-1">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </ListGroup.Item>
                );
              })
            ) : (
              <p>Bạn chưa có cuộc trò chuyện nào.</p>
            )}
          </ListGroup>
        )}
      </Container>
    </>
  );
};

export default ChatList; 