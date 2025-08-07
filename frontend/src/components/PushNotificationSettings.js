import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Form, Row, Col } from 'react-bootstrap';
import pushNotificationService from '../services/pushNotificationService';
import { useAuth } from '../contexts/AuthContext';

const PushNotificationSettings = () => {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    email: true,
    push: true,
    sms: false,
    booking: true,
    payment: true,
    message: true,
    system: true
  });
  const [deviceToken, setDeviceToken] = useState(null);

  useEffect(() => {
    // Kiểm tra trạng thái thông báo hiện tại
    checkNotificationStatus();
    // Load cài đặt thông báo
    loadSettings();
  }, []);

  const checkNotificationStatus = async () => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      setEnabled(permission === 'granted');
      
      if (permission === 'granted') {
        // Lấy device token nếu đã có
        const token = await pushNotificationService.getDeviceToken();
        setDeviceToken(token);
      }
    }
  };

  const loadSettings = async () => {
    try {
      const data = await pushNotificationService.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      const granted = await pushNotificationService.requestPermission();
      if (granted) {
        // Tạo subscription mới
        const subscription = await pushNotificationService.createSubscription();
        setDeviceToken(subscription);
        
        // Đăng ký với backend
        await pushNotificationService.subscribe(subscription);
        
        setEnabled(true);
        setStatus('Đã bật thông báo push thành công!');
      } else {
        setStatus('Bạn chưa cho phép nhận thông báo. Vui lòng cấp quyền trong trình duyệt.');
      }
    } catch (error) {
      setStatus(`Lỗi khi bật thông báo: ${error.message}`);
      console.error('Error enabling push notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      if (deviceToken) {
        await pushNotificationService.unsubscribe(deviceToken);
      }
      setEnabled(false);
      setDeviceToken(null);
      setStatus('Đã tắt thông báo push');
    } catch (error) {
      setStatus(`Lỗi khi tắt thông báo: ${error.message}`);
      console.error('Error disabling push notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setLoading(true);
    try {
      await pushNotificationService.sendTestNotification(user.id);
      setStatus('Đã gửi thử thông báo thành công!');
    } catch (error) {
      setStatus(`Lỗi khi gửi thử thông báo: ${error.message}`);
      console.error('Error sending test notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    try {
      await pushNotificationService.updateSettings(newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      // Revert change on error
      setSettings(settings);
    }
  };

  const isSupported = 'Notification' in window && 'serviceWorker' in navigator;

  if (!isSupported) {
    return (
      <Card>
        <Card.Header>
          <h5 className="mb-0">Cài đặt thông báo</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="warning">
            Trình duyệt của bạn không hỗ trợ push notifications.
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Cài đặt thông báo</h5>
      </Card.Header>
      <Card.Body>
        {status && (
          <Alert variant={status.includes('Lỗi') ? 'danger' : 'success'} dismissible>
            {status}
          </Alert>
        )}

        <Row>
          <Col md={6}>
            <h6>Push Notifications</h6>
            <p className="text-muted">
              Nhận thông báo ngay lập tức khi có sự kiện mới
            </p>
            
            <div className="mb-3">
              <Button
                variant={enabled ? 'outline-danger' : 'primary'}
                onClick={enabled ? handleDisable : handleEnable}
                disabled={loading}
                className="me-2"
              >
                {loading ? <Spinner as="span" size="sm" /> : 
                  enabled ? 'Tắt thông báo' : 'Bật thông báo'
                }
              </Button>
              
              {enabled && (
                <Button
                  variant="outline-secondary"
                  onClick={handleTest}
                  disabled={loading}
                >
                  Gửi thử
                </Button>
              )}
            </div>

            <div className="mb-3">
              <small className="text-muted">
                Trạng thái: {enabled ? 'Đã bật' : 'Đã tắt'}
              </small>
            </div>
          </Col>

          <Col md={6}>
            <h6>Cài đặt chi tiết</h6>
            <Form>
              <Form.Check
                type="switch"
                id="booking-notifications"
                label="Thông báo đặt phòng"
                checked={settings.booking}
                onChange={(e) => handleSettingChange('booking', e.target.checked)}
              />
              <Form.Check
                type="switch"
                id="payment-notifications"
                label="Thông báo thanh toán"
                checked={settings.payment}
                onChange={(e) => handleSettingChange('payment', e.target.checked)}
              />
              <Form.Check
                type="switch"
                id="message-notifications"
                label="Thông báo tin nhắn"
                checked={settings.message}
                onChange={(e) => handleSettingChange('message', e.target.checked)}
              />
              <Form.Check
                type="switch"
                id="system-notifications"
                label="Thông báo hệ thống"
                checked={settings.system}
                onChange={(e) => handleSettingChange('system', e.target.checked)}
              />
            </Form>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default PushNotificationSettings; 