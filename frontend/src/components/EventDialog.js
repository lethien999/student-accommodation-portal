import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import eventService from '../services/eventService';

const eventTypeOptions = [
  { value: 'payment', label: 'Thanh toán' },
  { value: 'maintenance', label: 'Bảo trì' },
  { value: 'visit', label: 'Xem phòng' },
  { value: 'community', label: 'Cộng đồng' },
  { value: 'other', label: 'Khác' }
];

const EventDialog = ({ show, onHide, event, onSave }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'other',
    start: '',
    end: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        description: event.description || '',
        type: event.type || 'other',
        start: event.start ? new Date(event.start).toISOString().slice(0,16) : '',
        end: event.end ? new Date(event.end).toISOString().slice(0,16) : ''
      });
    } else {
      setForm(f => ({ ...f, title: '', description: '', type: 'other', start: '', end: '' }));
    }
    setError('');
  }, [event, show]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (event && event.id) {
        await eventService.updateEvent(event.id, {
          ...form,
          start: new Date(form.start),
          end: new Date(form.end)
        });
      } else {
        await eventService.createEvent({
          ...form,
          start: new Date(form.start),
          end: new Date(form.end)
        });
      }
      onSave && onSave();
      onHide();
    } catch (err) {
      setError('Lỗi khi lưu sự kiện');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{event && event.id ? 'Sửa sự kiện' : 'Tạo sự kiện'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-2">
            <Form.Label>Tiêu đề</Form.Label>
            <Form.Control name="title" value={form.title} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control as="textarea" name="description" value={form.description} onChange={handleChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Loại sự kiện</Form.Label>
            <Form.Select name="type" value={form.type} onChange={handleChange} required>
              {eventTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Bắt đầu</Form.Label>
            <Form.Control type="datetime-local" name="start" value={form.start} onChange={handleChange} required />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Kết thúc</Form.Label>
            <Form.Control type="datetime-local" name="end" value={form.end} onChange={handleChange} required />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Hủy</Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : 'Lưu'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EventDialog; 