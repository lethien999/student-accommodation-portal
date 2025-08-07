import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Badge, Spinner, Modal, Nav, ProgressBar } from 'react-bootstrap';
import { FaPlus, FaTrash, FaEye, FaChartLine, FaBrain, FaComments, FaUser, FaClock } from 'react-icons/fa';
import chatbotService from '../services/chatbotService';

const ChatbotAIManagement = ({ isActive }) => {
  const [conversations, setConversations] = useState([]);
  const [trainingData, setTrainingData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showConversationModal, setShowConversationModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [trainingForm, setTrainingForm] = useState({
    question: '',
    answer: '',
    category: '',
    tags: []
  });

  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    category: '',
    status: ''
  });

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [convData, trainData, analyticsData] = await Promise.all([
        chatbotService.getConversations(filters),
        chatbotService.getTrainingData(),
        chatbotService.getChatbotAnalytics(),
      ]);
      setConversations(convData.conversations || []);
      setTrainingData(trainData.trainingData || []);
      setAnalytics(analyticsData);
    } catch (error) {
      setError('Lỗi khi tải dữ liệu ban đầu cho chatbot');
      console.error('Error fetching chatbot data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isActive) {
      fetchInitialData();
    }
  }, [isActive, fetchInitialData]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleTrainingFormChange = (key, value) => {
    setTrainingForm(prev => ({ ...prev, [key]: value }));
  };

  const openTrainingModal = () => {
    setTrainingForm({
      question: '',
      answer: '',
      category: '',
      tags: []
    });
    setShowTrainingModal(true);
  };

  const openConversationModal = (conversation) => {
    setSelectedConversation(conversation);
    setShowConversationModal(true);
  };

  const handleSaveTrainingData = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await chatbotService.createTrainingData(trainingForm);
      
      setSuccess('Lưu dữ liệu training thành công!');
      setShowTrainingModal(false);
      fetchInitialData();
    } catch (error) {
      setError('Lỗi khi lưu dữ liệu training');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrainingData = async (item) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dữ liệu training này?')) {
      try {
        await chatbotService.deleteTrainingData(item.id);
        setSuccess('Xóa dữ liệu training thành công!');
        fetchInitialData();
      } catch (error) {
        setError('Lỗi khi xóa dữ liệu training');
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'success',
      active: 'primary',
      abandoned: 'warning',
      failed: 'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getCategoryBadge = (category) => {
    const variants = {
      general: 'info',
      booking: 'success',
      payment: 'warning',
      support: 'danger'
    };
    return <Badge bg={variants[category] || 'secondary'}>{category}</Badge>;
  };

  const formatDuration = (startTime, endTime) => {
    if (!endTime) return 'Đang diễn ra';
    const duration = new Date(endTime) - new Date(startTime);
    const minutes = Math.floor(duration / 60000);
    return `${minutes} phút`;
  };

  if (loading && conversations.length === 0) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
      
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FaBrain className="me-2" />
                  Quản lý Chatbot AI
                </h5>
                <Button variant="primary" size="sm" onClick={openTrainingModal}>
                  <FaPlus className="me-1" />
                  Thêm dữ liệu training
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'overview'} 
                    onClick={() => setActiveTab('overview')}
                  >
                    Tổng quan
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'conversations'} 
                    onClick={() => setActiveTab('conversations')}
                  >
                    Cuộc hội thoại
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link 
                    active={activeTab === 'training'} 
                    onClick={() => setActiveTab('training')}
                  >
                    Dữ liệu training
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              {activeTab === 'overview' && analytics && (
                <div>
                  <Row className="mb-4">
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <FaComments size={32} className="text-primary mb-2" />
                          <h4 className="text-primary">{analytics.totalConversations}</h4>
                          <p className="text-muted mb-0">Tổng cuộc hội thoại</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <FaUser size={32} className="text-success mb-2" />
                          <h4 className="text-success">{analytics.activeConversations}</h4>
                          <p className="text-muted mb-0">Đang hoạt động</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <FaChartLine size={32} className="text-warning mb-2" />
                          <h4 className="text-warning">{analytics.averageSatisfaction}</h4>
                          <p className="text-muted mb-0">Đánh giá trung bình</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center">
                        <Card.Body>
                          <FaClock size={32} className="text-info mb-2" />
                          <h4 className="text-info">{analytics.responseTime}s</h4>
                          <p className="text-muted mb-0">Thời gian phản hồi</p>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Card>
                        <Card.Header>
                          <h6 className="mb-0">Phân bố theo danh mục</h6>
                        </Card.Header>
                        <Card.Body>
                          {analytics.categories && Object.entries(analytics.categories).map(([category, count]) => (
                            <div key={category} className="mb-2">
                              <div className="d-flex justify-content-between">
                                <span>{category}</span>
                                <span>{count}</span>
                              </div>
                              <ProgressBar 
                                now={(count / analytics.totalConversations) * 100} 
                                className="mt-1"
                              />
                            </div>
                          ))}
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card>
                        <Card.Header>
                          <h6 className="mb-0">Thống kê hàng ngày</h6>
                        </Card.Header>
                        <Card.Body>
                          {analytics.dailyStats && analytics.dailyStats.map((stat, index) => (
                            <div key={index} className="mb-2">
                              <div className="d-flex justify-content-between">
                                <span>{new Date(stat.date).toLocaleDateString('vi-VN')}</span>
                                <span>{stat.conversations} cuộc hội thoại</span>
                              </div>
                              <small className="text-muted">Đánh giá: {stat.satisfaction}</small>
                            </div>
                          ))}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}

              {activeTab === 'conversations' && (
                <div>
                  <div className="row mb-3">
                    <div className="col-md-3">
                      <Form.Select 
                        value={filters.status} 
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      >
                        <option value="">Tất cả trạng thái</option>
                        <option value="active">Đang hoạt động</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="abandoned">Bị bỏ dở</option>
                      </Form.Select>
                    </div>
                    <div className="col-md-3">
                      <Form.Select 
                        value={filters.category} 
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                      >
                        <option value="">Tất cả danh mục</option>
                        <option value="general">Chung</option>
                        <option value="booking">Đặt phòng</option>
                        <option value="payment">Thanh toán</option>
                        <option value="support">Hỗ trợ</option>
                      </Form.Select>
                    </div>
                  </div>

                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Người dùng</th>
                        <th>Danh mục</th>
                        <th>Trạng thái</th>
                        <th>Số tin nhắn</th>
                        <th>Thời gian</th>
                        <th>Đánh giá</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {conversations.map((conversation) => (
                        <tr key={conversation.id}>
                          <td>{conversation.userName}</td>
                          <td>{getCategoryBadge(conversation.category)}</td>
                          <td>{getStatusBadge(conversation.status)}</td>
                          <td>{conversation.messageCount}</td>
                          <td>{formatDuration(conversation.startTime, conversation.endTime)}</td>
                          <td>
                            {conversation.satisfaction ? (
                              <span className="text-warning">
                                {'★'.repeat(conversation.satisfaction)}
                              </span>
                            ) : (
                              <span className="text-muted">Chưa đánh giá</span>
                            )}
                          </td>
                          <td>
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => openConversationModal(conversation)}
                            >
                              <FaEye />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}

              {activeTab === 'training' && (
                <div>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th>Câu hỏi</th>
                        <th>Danh mục</th>
                        <th>Tags</th>
                        <th>Lượt sử dụng</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trainingData.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.question}
                            </div>
                          </td>
                          <td>{getCategoryBadge(item.category)}</td>
                          <td>
                            {item.tags && JSON.parse(item.tags).map((tag, index) => (
                              <Badge key={index} bg="light" text="dark" className="me-1">
                                {tag}
                              </Badge>
                            ))}
                          </td>
                          <td>{item.usageCount}</td>
                          <td>
                            <Badge bg={item.isActive ? 'success' : 'secondary'}>
                              {item.isActive ? 'Hoạt động' : 'Không hoạt động'}
                            </Badge>
                          </td>
                          <td>
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              onClick={() => handleDeleteTrainingData(item)}
                            >
                              <FaTrash />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Training Data Modal */}
      <Modal show={showTrainingModal} onHide={() => setShowTrainingModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Thêm dữ liệu training</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Câu hỏi</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={trainingForm.question}
                onChange={(e) => handleTrainingFormChange('question', e.target.value)}
                placeholder="Nhập câu hỏi mẫu"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Câu trả lời</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={trainingForm.answer}
                onChange={(e) => handleTrainingFormChange('answer', e.target.value)}
                placeholder="Nhập câu trả lời mẫu"
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Select
                    value={trainingForm.category}
                    onChange={(e) => handleTrainingFormChange('category', e.target.value)}
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="general">Chung</option>
                    <option value="booking">Đặt phòng</option>
                    <option value="payment">Thanh toán</option>
                    <option value="support">Hỗ trợ</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tags (phân cách bằng dấu phẩy)</Form.Label>
                  <Form.Control
                    type="text"
                    value={trainingForm.tags.join(', ')}
                    onChange={(e) => handleTrainingFormChange('tags', e.target.value.split(',').map(tag => tag.trim()))}
                    placeholder="tag1, tag2, tag3"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTrainingModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveTrainingData} disabled={saving}>
            {saving ? <Spinner animation="border" size="sm" /> : 'Lưu dữ liệu'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Conversation Detail Modal */}
      <Modal show={showConversationModal} onHide={() => setShowConversationModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết cuộc hội thoại</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedConversation && (
            <div>
              <div className="mb-3">
                <strong>Người dùng:</strong> {selectedConversation.userName}
              </div>
              <div className="mb-3">
                <strong>Danh mục:</strong> {getCategoryBadge(selectedConversation.category)}
              </div>
              <div className="mb-3">
                <strong>Trạng thái:</strong> {getStatusBadge(selectedConversation.status)}
              </div>
              <div className="mb-3">
                <strong>Thời gian:</strong> {formatDuration(selectedConversation.startTime, selectedConversation.endTime)}
              </div>
              {selectedConversation.satisfaction && (
                <div className="mb-3">
                  <strong>Đánh giá:</strong> {selectedConversation.satisfaction}/5
                </div>
              )}
              <div>
                <strong>Tin nhắn:</strong>
                <div className="mt-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {/* Messages would be displayed here if available */}
                  <p className="text-muted">Chi tiết tin nhắn sẽ được hiển thị ở đây</p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConversationModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ChatbotAIManagement; 