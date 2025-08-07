import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Alert, Spinner, Modal, Form, ListGroup } from 'react-bootstrap';
import { FaBell, FaEnvelope, FaTrash, FaCheck, FaCog, FaPlus } from 'react-icons/fa';
import notificationService from '../services/notificationService';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';

const NotificationManagement = ({ isActive }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    booking: true,
    payment: true,
    message: true,
    system: true
  });

  // Form state for creating notifications
  const [createForm, setCreateForm] = useState({
    title: '',
    message: '',
    type: 'system',
    priority: 'normal',
    targetUsers: 'all'
  });

  // Initialize WebSocket connection
  useEffect(() => {
    if (user && isActive) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        query: { token: localStorage.getItem('token') }
      });

      newSocket.on('connect', () => {
        console.log('Connected to notification socket');
      });

      newSocket.on('newNotification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      newSocket.on('notificationRead', (notificationId) => {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, isActive]);

  // Load notifications and settings
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [notifData, settingsData] = await Promise.all([
          notificationService.getNotifications(),
          notificationService.getNotificationSettings()
        ]);
        
        setNotifications(notifData.notifications || []);
        setUnreadCount(notifData.unreadCount || 0);
        setNotificationSettings(settingsData);

      } catch (error) {
        setError('Lỗi khi tải dữ liệu thông báo');
        console.error('Error loading notification data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isActive) {
      loadInitialData();
    }
  }, [isActive]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Emit to socket
      if (socket) {
        socket.emit('markAsRead', notificationId);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      if (!notifications.find(n => n.id === notificationId)?.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Update notification settings
  const updateSettings = async (newSettings) => {
    try {
      await notificationService.updateNotificationSettings(newSettings);
      setNotificationSettings(newSettings);
      setShowSettings(false);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  // Create notification
  const createNotification = async (e) => {
    e.preventDefault();
    try {
      await notificationService.createNotification(createForm);
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        message: '',
        type: 'system',
        priority: 'normal',
        targetUsers: 'all'
      });
      // Reload notifications
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  // Get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <FaEnvelope className="text-primary" />;
      case 'payment':
        return <FaBell className="text-success" />;
      case 'message':
        return <FaEnvelope className="text-info" />;
      case 'system':
        return <FaCog className="text-warning" />;
      default:
        return <FaBell className="text-secondary" />;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge bg="danger">Cao</Badge>;
      case 'normal':
        return <Badge bg="primary">Bình thường</Badge>;
      case 'low':
        return <Badge bg="secondary">Thấp</Badge>;
      default:
        return <Badge bg="primary">Bình thường</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="notification-management">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-1">
                <FaBell className="me-2" />
                Quản lý thông báo
              </h4>
              <p className="text-muted mb-0">
                {unreadCount} thông báo chưa đọc
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                onClick={() => setShowSettings(true)}
              >
                <FaCog className="me-1" />
                Cài đặt
              </Button>
              {user?.role === 'admin' && (
                <Button
                  variant="primary"
                  onClick={() => setShowCreateModal(true)}
                >
                  <FaPlus className="me-1" />
                  Tạo thông báo
                </Button>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* Error Display */}
      {error && (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      )}

      {/* Notifications List */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Thông báo</h6>
          {unreadCount > 0 && (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={markAllAsRead}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          {notifications.length > 0 ? (
            <ListGroup variant="flush">
              {notifications.map(notification => (
                <ListGroup.Item
                  key={notification.id}
                  className={`d-flex justify-content-between align-items-start ${
                    !notification.read ? 'bg-light' : ''
                  }`}
                >
                  <div className="d-flex align-items-start flex-grow-1">
                    <div className="me-3 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="mb-1">
                          {notification.title}
                          {!notification.read && (
                            <Badge bg="primary" className="ms-2">Mới</Badge>
                          )}
                        </h6>
                        <div className="d-flex gap-1">
                          {getPriorityBadge(notification.priority)}
                        </div>
                      </div>
                      <p className="mb-1">{notification.message}</p>
                      <small className="text-muted">
                        {new Date(notification.createdAt).toLocaleString('vi-VN')}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex gap-1">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="outline-success"
                        onClick={() => markAsRead(notification.id)}
                      >
                        <FaCheck />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <div className="text-center py-4">
              <FaBell className="text-muted mb-3" size={48} />
              <h6 className="text-muted">Không có thông báo nào</h6>
              <p className="text-muted">Bạn sẽ nhận được thông báo khi có hoạt động mới</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Notification Settings Modal */}
      <Modal show={showSettings} onHide={() => setShowSettings(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Cài đặt thông báo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md={6}>
              <h6>Phương thức nhận thông báo</h6>
              <Form.Check
                type="checkbox"
                label="Email"
                checked={notificationSettings.email}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  email: e.target.checked
                }))}
              />
              <Form.Check
                type="checkbox"
                label="Push notification"
                checked={notificationSettings.push}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  push: e.target.checked
                }))}
              />
              <Form.Check
                type="checkbox"
                label="SMS"
                checked={notificationSettings.sms}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  sms: e.target.checked
                }))}
              />
            </Col>
            <Col md={6}>
              <h6>Loại thông báo</h6>
              <Form.Check
                type="checkbox"
                label="Đặt phòng"
                checked={notificationSettings.booking}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  booking: e.target.checked
                }))}
              />
              <Form.Check
                type="checkbox"
                label="Thanh toán"
                checked={notificationSettings.payment}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  payment: e.target.checked
                }))}
              />
              <Form.Check
                type="checkbox"
                label="Tin nhắn"
                checked={notificationSettings.message}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  message: e.target.checked
                }))}
              />
              <Form.Check
                type="checkbox"
                label="Hệ thống"
                checked={notificationSettings.system}
                onChange={(e) => setNotificationSettings(prev => ({
                  ...prev,
                  system: e.target.checked
                }))}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSettings(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={() => updateSettings(notificationSettings)}>
            Lưu cài đặt
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Create Notification Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Tạo thông báo mới</Modal.Title>
        </Modal.Header>
        <Form onSubmit={createNotification}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                type="text"
                value={createForm.title}
                onChange={(e) => setCreateForm(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nội dung</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={createForm.message}
                onChange={(e) => setCreateForm(prev => ({
                  ...prev,
                  message: e.target.value
                }))}
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại</Form.Label>
                  <Form.Select
                    value={createForm.type}
                    onChange={(e) => setCreateForm(prev => ({
                      ...prev,
                      type: e.target.value
                    }))}
                  >
                    <option value="system">Hệ thống</option>
                    <option value="booking">Đặt phòng</option>
                    <option value="payment">Thanh toán</option>
                    <option value="message">Tin nhắn</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mức độ ưu tiên</Form.Label>
                  <Form.Select
                    value={createForm.priority}
                    onChange={(e) => setCreateForm(prev => ({
                      ...prev,
                      priority: e.target.value
                    }))}
                  >
                    <option value="low">Thấp</option>
                    <option value="normal">Bình thường</option>
                    <option value="high">Cao</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Đối tượng nhận</Form.Label>
              <Form.Select
                value={createForm.targetUsers}
                onChange={(e) => setCreateForm(prev => ({
                  ...prev,
                  targetUsers: e.target.value
                }))}
              >
                <option value="all">Tất cả người dùng</option>
                <option value="tenants">Chỉ người thuê</option>
                <option value="landlords">Chỉ chủ nhà</option>
                <option value="admins">Chỉ admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Tạo thông báo
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default NotificationManagement; 