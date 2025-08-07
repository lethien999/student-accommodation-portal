import React, { useState, useEffect } from 'react';
import { Modal, Table, Spinner, Alert, Button } from 'react-bootstrap';
import activityService from '../services/activityService';
import { useTimezone } from '../contexts/TimezoneContext';

const AuditTrailDialog = ({ show, onHide, objectId, objectType }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { formatDateTime } = useTimezone();

  useEffect(() => {
    if (show && objectId && objectType) {
      setLoading(true);
      setError('');
      activityService.getActivityLogs({ objectId, objectType, limit: 50 })
        .then(data => setLogs(data.logs || data || []))
        .catch(() => setError('Lỗi khi tải lịch sử thay đổi'))
        .finally(() => setLoading(false));
    }
  }, [show, objectId, objectType]);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Lịch sử thay đổi</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? <div className="text-center"><Spinner animation="border" /></div> :
        error ? <Alert variant="danger">{error}</Alert> : (
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thao tác</th>
                <th>Hành động</th>
                <th>Trường thay đổi</th>
                <th>Giá trị cũ</th>
                <th>Giá trị mới</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan={6} className="text-center">Không có dữ liệu</td></tr>
              ) : logs.map(log => (
                <tr key={log.id}>
                  <td>{formatDateTime(log.createdAt)}</td>
                  <td>{log.user?.username || 'N/A'}</td>
                  <td>{log.action}</td>
                  <td>{log.field || '-'}</td>
                  <td>{log.oldValue ?? '-'}</td>
                  <td>{log.newValue ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Đóng</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AuditTrailDialog; 