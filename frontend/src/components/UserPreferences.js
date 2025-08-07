import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Form, Alert, 
  Badge, Accordion, ListGroup, Modal, Table 
} from 'react-bootstrap';
import { 
  FaCog, FaBell, FaEye, FaSearch, FaShieldAlt, 
  FaSave, FaUndo, FaUsers, FaUser
} from 'react-icons/fa';
import preferenceService from '../services/preferenceService';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const UserPreferences = ({ userId = null, isAdmin = false, isActive }) => {
  const { user: currentUser } = useAuth();
  const [preferences, setPreferences] = useState({});
  const [defaultPreferences, setDefaultPreferences] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetCategory, setResetCategory] = useState('');
  
  // Admin-specific state
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(userId);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const { theme, setTheme, setPrimaryColor, setFont, setLayout } = useTheme();

  const fetchPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const targetUserId = selectedUserId || currentUser?.id;
      console.log('Fetching preferences for userId:', targetUserId);
      
      const [userPrefs, defaultPrefs] = await Promise.all([
        preferenceService.getUserPreferences(targetUserId),
        preferenceService.getDefaultPreferences()
      ]);
      
      console.log('User preferences:', userPrefs);
      console.log('Default preferences:', defaultPrefs);
      
      setPreferences(userPrefs || {});
      setDefaultPreferences(defaultPrefs || {});
    } catch (error) {
      console.error('Error fetching preferences:', error);
      setError(`Lỗi khi tải tùy chọn: ${error.message || 'Unknown error'}`);
      setPreferences({});
      setDefaultPreferences({});
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, currentUser?.id]);

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers({ limit: 100 });
      setUsers(response.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (isActive) {
      fetchPreferences();
    }
  }, [fetchPreferences, isActive]);

  useEffect(() => {
    if (isAdmin && showUserSelector && isActive) {
      fetchUsers();
    }
  }, [isAdmin, showUserSelector, isActive]);

  const handlePreferenceChange = (category, key, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: prev[category]?.map(pref => 
        pref.key === key ? { ...pref, value } : pref
      ) || []
    }));
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const targetUserId = selectedUserId || currentUser?.id;

      // Chuẩn bị dữ liệu để lưu
      const preferencesToSave = [];
      Object.entries(preferences).forEach(([category, prefs]) => {
        prefs.forEach(pref => {
          preferencesToSave.push({
            category,
            key: pref.key,
            value: pref.value,
            description: pref.description
          });
        });
      });

      await preferenceService.setMultiplePreferences(preferencesToSave, targetUserId);
      setSuccess('Đã lưu tùy chọn thành công!');
    } catch (error) {
      setError('Lỗi khi lưu tùy chọn');
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const resetPreferences = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const targetUserId = selectedUserId || currentUser?.id;
      await preferenceService.resetPreferences(resetCategory, targetUserId);
      await fetchPreferences(); // Reload preferences
      setSuccess(`Đã reset tùy chọn${resetCategory ? ` cho ${resetCategory}` : ''} thành công!`);
      setShowResetModal(false);
      setResetCategory('');
    } catch (error) {
      setError('Lỗi khi reset tùy chọn');
      console.error('Error resetting preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const getPreferenceValue = (category, key) => {
    return preferences[category]?.find(pref => pref.key === key)?.value;
  };

  const renderPreferenceInput = (pref, category) => {
    const value = getPreferenceValue(category, pref.key);
    
    if (typeof pref.value === 'boolean') {
      return (
        <Form.Check
          type="switch"
          id={`${category}-${pref.key}`}
          checked={value || false}
          onChange={(e) => handlePreferenceChange(category, pref.key, e.target.checked)}
          label={pref.description}
        />
      );
    } else if (typeof pref.value === 'number') {
      return (
        <Form.Group>
          <Form.Label>{pref.description}</Form.Label>
          <Form.Control
            type="number"
            value={value || pref.value}
            onChange={(e) => handlePreferenceChange(category, pref.key, Number(e.target.value))}
          />
        </Form.Group>
      );
    } else if (typeof pref.value === 'object' && pref.value !== null) {
      // Handle object preferences (like price range)
      return (
        <Form.Group>
          <Form.Label>{pref.description}</Form.Label>
          <Row>
            <Col>
              <Form.Control
                type="number"
                placeholder="Min"
                value={value?.min || pref.value?.min || 0}
                onChange={(e) => handlePreferenceChange(category, pref.key, {
                  ...value,
                  min: Number(e.target.value)
                })}
              />
            </Col>
            <Col>
              <Form.Control
                type="number"
                placeholder="Max"
                value={value?.max || pref.value?.max || 0}
                onChange={(e) => handlePreferenceChange(category, pref.key, {
                  ...value,
                  max: Number(e.target.value)
                })}
              />
            </Col>
          </Row>
        </Form.Group>
      );
    } else {
      // String or other types
      return (
        <Form.Group>
          <Form.Label>{pref.description}</Form.Label>
          <Form.Control
            type="text"
            value={value || pref.value || ''}
            onChange={(e) => handlePreferenceChange(category, pref.key, e.target.value)}
          />
        </Form.Group>
      );
    }
  };

  const getSelectedUserName = () => {
    if (!selectedUserId) return currentUser?.username || 'Tôi';
    const selectedUser = users.find(u => u.id === selectedUserId);
    return selectedUser?.username || `User ${selectedUserId}`;
  };

  // Thay đổi theme nâng cao
  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };
  const handleColorChange = (e) => {
    setPrimaryColor(e.target.value);
  };
  const handleFontChange = (e) => {
    setFont(e.target.value);
  };
  const handleLayoutChange = (e) => {
    setLayout(e.target.value);
  };

  // Render notification channel config
  const renderNotificationChannels = () => {
    const notificationPrefs = preferences['notification'] || [];
    const channelOptions = [
      { key: 'email', label: 'Email' },
      { key: 'push', label: 'Push' },
      { key: 'sms', label: 'SMS' },
      { key: 'inapp', label: 'Trong ứng dụng' }
    ];
    return (
      <Card className="mb-4">
        <Card.Header>
          <FaBell className="me-2" /> Cấu hình kênh nhận thông báo
        </Card.Header>
        <Card.Body>
          <Table bordered size="sm">
            <thead>
              <tr>
                <th>Loại thông báo</th>
                {channelOptions.map(ch => <th key={ch.key}>{ch.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {notificationPrefs.map(pref => (
                <tr key={pref.key}>
                  <td>{pref.description || pref.key}</td>
                  {channelOptions.map(ch => (
                    <td key={ch.key} className="text-center">
                      <Form.Check
                        type="checkbox"
                        checked={Array.isArray(pref.channels) ? pref.channels.includes(ch.key) : (ch.key === 'email' ? !!pref.value : false)}
                        onChange={e => {
                          const newChannels = Array.isArray(pref.channels) ? [...pref.channels] : (pref.channels ? [pref.channels] : []);
                          if (e.target.checked) {
                            if (!newChannels.includes(ch.key)) newChannels.push(ch.key);
                          } else {
                            const idx = newChannels.indexOf(ch.key);
                            if (idx > -1) newChannels.splice(idx, 1);
                          }
                          handlePreferenceChange('notification', pref.key, { ...pref, channels: newChannels });
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  // Fallback for when there's an error and no data
  if (error && (!defaultPreferences || Object.keys(defaultPreferences).length === 0)) {
    return (
      <Container fluid className="mt-4">
        <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>
        <Card>
          <Card.Header>
            <h5 className="mb-0">
              <FaCog className="me-2" />
              Tùy chọn người dùng
            </h5>
          </Card.Header>
          <Card.Body className="text-center">
            <p className="text-muted">Không thể tải tùy chọn. Vui lòng thử lại.</p>
            <Button variant="outline-primary" onClick={fetchPreferences}>
              Tải lại
            </Button>
          </Card.Body>
        </Card>
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
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <h5 className="mb-0">
                  <FaCog className="me-2" />
                  Tùy chọn người dùng
                </h5>
                {isAdmin && (
                  <div className="ms-3">
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => setShowUserSelector(true)}
                    >
                      <FaUsers className="me-1" />
                      Chọn User
                    </Button>
                    <Badge bg="info" className="ms-2">
                      {getSelectedUserName()}
                    </Badge>
                  </div>
                )}
              </div>
              <div>
                <Button 
                  variant="outline-warning" 
                  className="me-2"
                  onClick={() => setShowResetModal(true)}
                >
                  <FaUndo className="me-2" />
                  Reset
                </Button>
                <Button 
                  variant="primary" 
                  onClick={savePreferences}
                  disabled={saving}
                >
                  <FaSave className="me-2" />
                  {saving ? 'Đang lưu...' : 'Lưu tất cả'}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              <Accordion defaultActiveKey="notification">
                {Object.entries(defaultPreferences || {}).map(([category, prefs]) => (
                  <Accordion.Item key={category} eventKey={category}>
                    <Accordion.Header>
                      <div className="d-flex align-items-center">
                        {category === 'notification' && <FaBell className="me-2" />}
                        {category === 'privacy' && <FaEye className="me-2" />}
                        {category === 'display' && <FaCog className="me-2" />}
                        {category === 'search' && <FaSearch className="me-2" />}
                        {category === 'security' && <FaShieldAlt className="me-2" />}
                        <strong>{category.toUpperCase()}</strong>
                        <Badge bg="info" className="ms-2">{(prefs || []).length}</Badge>
                      </div>
                    </Accordion.Header>
                    <Accordion.Body>
                      <ListGroup variant="flush">
                        {(prefs || []).map(pref => (
                          <ListGroup.Item key={pref.key}>
                            {renderPreferenceInput(pref, category)}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
              
              {(!defaultPreferences || Object.keys(defaultPreferences).length === 0) && (
                <div className="text-center py-4">
                  <p className="text-muted">Không có tùy chọn nào được tải. Vui lòng thử lại.</p>
                  <Button variant="outline-primary" onClick={fetchPreferences}>
                    Tải lại
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header>
          <FaCog className="me-2" /> Tuỳ biến giao diện nâng cao
        </Card.Header>
        <Card.Body>
          <Form>
            <Form.Group as={Row} className="mb-3" controlId="themeMode">
              <Form.Label column sm={3}>Chế độ giao diện</Form.Label>
              <Col sm={9}>
                <Form.Select value={theme.mode} onChange={handleThemeChange}>
                  <option value="light">Sáng</option>
                  <option value="dark">Tối</option>
                </Form.Select>
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="primaryColor">
              <Form.Label column sm={3}>Màu chủ đạo</Form.Label>
              <Col sm={9}>
                <Form.Control type="color" value={theme.primaryColor} onChange={handleColorChange} style={{ width: 60, height: 40, padding: 0, border: 'none' }} />
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="fontFamily">
              <Form.Label column sm={3}>Font chữ</Form.Label>
              <Col sm={9}>
                <Form.Select value={theme.font} onChange={handleFontChange}>
                  <option value="Roboto, Arial, sans-serif">Roboto</option>
                  <option value="Arial, Helvetica, sans-serif">Arial</option>
                  <option value="Tahoma, Geneva, sans-serif">Tahoma</option>
                  <option value="Times New Roman, Times, serif">Times New Roman</option>
                </Form.Select>
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="layoutMode">
              <Form.Label column sm={3}>Bố cục</Form.Label>
              <Col sm={9}>
                <Form.Select value={theme.layout} onChange={handleLayoutChange}>
                  <option value="comfortable">Thoải mái</option>
                  <option value="compact">Gọn gàng</option>
                </Form.Select>
              </Col>
            </Form.Group>
          </Form>
          <div className="mt-3">
            <span style={{ color: theme.primaryColor, fontFamily: theme.font }}>
              Xem trước: Đây là giao diện {theme.mode === 'dark' ? 'tối' : 'sáng'}, màu chủ đạo, font và bố cục bạn đã chọn.
            </span>
          </div>
        </Card.Body>
      </Card>

      {renderNotificationChannels()}

      {/* User Selector Modal for Admin */}
      <Modal show={showUserSelector} onHide={() => setShowUserSelector(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chọn người dùng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              placeholder="Tìm kiếm người dùng..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
          </Form.Group>
          <div className="table-responsive" style={{ maxHeight: '400px' }}>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(user => 
                    user.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
                    user.email?.toLowerCase().includes(userSearch.toLowerCase())
                  )
                  .map(user => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>
                        <Badge bg={
                          user.role === 'admin' ? 'danger' :
                          user.role === 'landlord' ? 'warning' :
                          user.role === 'moderator' ? 'info' : 'secondary'
                        }>
                          {user.role}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant={selectedUserId === user.id ? 'success' : 'outline-primary'}
                          onClick={() => {
                            setSelectedUserId(user.id);
                            setShowUserSelector(false);
                          }}
                        >
                          <FaUser className="me-1" />
                          {selectedUserId === user.id ? 'Đã chọn' : 'Chọn'}
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserSelector(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Reset Modal */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reset tùy chọn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có muốn reset tùy chọn về mặc định không?</p>
          <Form.Group>
            <Form.Label>Chọn danh mục (để trống để reset tất cả):</Form.Label>
            <Form.Select 
              value={resetCategory} 
              onChange={(e) => setResetCategory(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              <option value="notification">Thông báo</option>
              <option value="privacy">Quyền riêng tư</option>
              <option value="display">Hiển thị</option>
              <option value="search">Tìm kiếm</option>
              <option value="security">Bảo mật</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="warning" 
            onClick={resetPreferences}
            disabled={saving}
          >
            {saving ? 'Đang reset...' : 'Reset'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserPreferences; 