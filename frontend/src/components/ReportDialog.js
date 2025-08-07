import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import reportService from '../services/reportService';

const ReportDialog = ({ show, onHide, targetType, targetId, currentUser }) => {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      await reportService.createReport({
        targetType,
        targetId,
        reason,
        details,
        userId: currentUser?.id
      });
      setSuccess('Gửi báo cáo thành công!');
      setReason('');
      setDetails('');
      if (onHide) onHide();
    } catch (err) {
      setError('Lỗi khi gửi báo cáo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Báo cáo vi phạm</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Lý do báo cáo *</Form.Label>
            <Form.Control
              as="select"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            >
              <option value="">-- Chọn lý do --</option>
              <option value="spam">Spam</option>
              <option value="inappropriate">Nội dung không phù hợp</option>
              <option value="fraud">Lừa đảo</option>
              <option value="other">Khác</option>
            </Form.Control>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Chi tiết</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Mô tả chi tiết về vi phạm..."
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ReportDialog; 