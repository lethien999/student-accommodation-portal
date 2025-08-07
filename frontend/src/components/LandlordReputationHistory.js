import React, { useEffect, useState } from 'react';
import { Table, Spinner, Alert, Badge } from 'react-bootstrap';
import landlordReputationService from '../services/landlordReputationService';

const LandlordReputationHistory = ({ userId }) => {
  const [rep, setRep] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    landlordReputationService.getReputation(userId)
      .then(setRep)
      .catch(() => setError('Lỗi khi lấy lịch sử uy tín'))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!rep || !rep.history || rep.history.length === 0) return <Alert variant="info">Chưa có lịch sử uy tín.</Alert>;

  return (
    <Table striped bordered hover size="sm">
      <thead>
        <tr>
          <th>Thời gian</th>
          <th>Điểm thay đổi</th>
          <th>Lý do</th>
          <th>Huy hiệu</th>
        </tr>
      </thead>
      <tbody>
        {rep.history.map((h, i) => (
          <tr key={i}>
            <td>{new Date(h.time).toLocaleString('vi-VN')}</td>
            <td className={h.delta > 0 ? 'text-success' : 'text-danger'}>{h.delta > 0 ? '+' : ''}{h.delta}</td>
            <td>{h.reason}</td>
            <td>{h.badge && <Badge bg="info">{h.badge}</Badge>}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default LandlordReputationHistory; 