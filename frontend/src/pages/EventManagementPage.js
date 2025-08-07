import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, ListGroup, Alert, Spinner } from 'react-bootstrap';
import EventCalendar from '../components/EventCalendar';
import eventService from '../services/eventService';
import accommodationService from '../services/accommodationService';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';

const EVENT_TYPES = ['maintenance', 'community', 'viewing', 'other'];
const EVENT_TYPE_LABELS = {
  maintenance: 'Bảo trì',
  community: 'Cộng đồng',
  viewing: 'Xem phòng',
  other: 'Khác',
};

const EventManagementPage = () => {
  const { user } = useAuth();
  const [accommodations, setAccommodations] = useState([]);
  const [selectedAccommodationId, setSelectedAccommodationId] = useState('');
  const [userEvents, setUserEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    type: 'other',
    accommodationId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUserAccommodations = useCallback(async () => {
    if (user?.role === 'landlord' || user?.role === 'admin') {
      try {
        // A service to get ONLY the current user's accommodations is needed.
        // Assuming accommodationService.getMyAccommodations exists.
        const data = await accommodationService.getMyAccommodations();
        setAccommodations(data);
      } catch (err) {
        console.error("Failed to fetch user accommodations", err);
      }
    }
  }, [user]);

  const fetchUserEvents = useCallback(async () => {
    try {
      const data = await eventService.getEvents({ userId: user.id });
      setUserEvents(data);
    } catch (err) {
      console.error("Failed to fetch user events", err);
    }
  }, [user]);

  useEffect(() => {
    fetchUserAccommodations();
    fetchUserEvents();
  }, [fetchUserAccommodations, fetchUserEvents]);

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title,
        description: editingEvent.description,
        start: new Date(editingEvent.start).toISOString().slice(0, 16),
        end: new Date(editingEvent.end).toISOString().slice(0, 16),
        type: editingEvent.type,
        accommodationId: editingEvent.accommodationId || ''
      });
      setSelectedAccommodationId(editingEvent.accommodationId || '');
    } else {
      resetForm();
    }
  }, [editingEvent]);

  const resetForm = () => {
    setFormData({
      title: '', description: '', start: '', end: '', type: 'other', accommodationId: ''
    });
    setEditingEvent(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'accommodationId') {
      setSelectedAccommodationId(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = { 
        ...formData, 
        accommodationId: formData.accommodationId || null 
    };

    try {
      if (editingEvent) {
        await eventService.updateEvent(editingEvent.id, payload);
      } else {
        await eventService.createEvent(payload);
      }
      resetForm();
      fetchUserEvents(); // Refresh list and calendar
    } catch (err) {
      setError(err.message || 'Lỗi khi lưu sự kiện.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      try {
        await eventService.deleteEvent(eventId);
        fetchUserEvents();
      } catch (err) {
        setError('Lỗi khi xóa sự kiện.');
      }
    }
  };

  return (
    <MainLayout>
      <Container fluid className="p-4">
        <h2>Quản lý Sự kiện</h2>
        <Row>
          <Col lg={4}>
            <Card className="mb-4">
              <Card.Header as="h5">{editingEvent ? 'Chỉnh sửa sự kiện' : 'Tạo sự kiện mới'}</Card.Header>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  {/* Form fields... */}
                  <Form.Group className="mb-3">
                    <Form.Label>Tiêu đề</Form.Label>
                    <Form.Control type="text" name="title" value={formData.title} onChange={handleInputChange} required />
                  </Form.Group>
                  {/* ... other fields like description, start, end, type */}
                   <Form.Group className="mb-3">
                    <Form.Label>Loại sự kiện</Form.Label>
                    <Form.Select name="type" value={formData.type} onChange={handleInputChange}>
                      {EVENT_TYPES.map(t => <option key={t} value={t}>{EVENT_TYPE_LABELS[t]}</option>)}
                    </Form.Select>
                  </Form.Group>
                  {(user?.role === 'landlord' || user?.role === 'admin') && accommodations.length > 0 && (
                    <Form.Group className="mb-3">
                        <Form.Label>Gắn với nhà trọ (Tùy chọn)</Form.Label>
                        <Form.Select name="accommodationId" value={formData.accommodationId} onChange={handleInputChange}>
                            <option value="">Chung (Không gắn với nhà nào)</option>
                            {accommodations.map(acc => <option key={acc.id} value={acc.id}>{acc.title}</option>)}
                        </Form.Select>
                    </Form.Group>
                  )}
                  {/* ... start and end datetime-local inputs */}
                  <div className="d-grid gap-2">
                    <Button type="submit" variant="primary" disabled={loading}>
                        {loading ? <Spinner size="sm"/> : (editingEvent ? 'Lưu thay đổi' : 'Tạo sự kiện')}
                    </Button>
                    {editingEvent && <Button variant="secondary" onClick={resetForm}>Hủy</Button>}
                  </div>
                </Form>
              </Card.Body>
            </Card>

            <Card>
                <Card.Header as="h5">Sự kiện của bạn</Card.Header>
                <ListGroup variant="flush">
                    {userEvents.map(event => (
                        <ListGroup.Item key={event.id} className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{event.title}</strong>
                                <br />
                                <small className="text-muted">{new Date(event.start).toLocaleString('vi-VN')}</small>
                            </div>
                            <div>
                                <Button variant="outline-primary" size="sm" className="me-2" onClick={() => setEditingEvent(event)}>Sửa</Button>
                                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(event.id)}>Xóa</Button>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card>
          </Col>
          <Col lg={8}>
            <EventCalendar key={selectedAccommodationId} accommodationId={selectedAccommodationId} />
          </Col>
        </Row>
      </Container>
    </MainLayout>
  );
};

export default EventManagementPage; 