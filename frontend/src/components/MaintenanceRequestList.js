import React, { useEffect, useState } from 'react';
import { Card, Button, Table, Spinner, Alert, Dropdown } from 'react-bootstrap';
import maintenanceService from '../services/maintenanceService';
import MaintenanceRequestDialog from './MaintenanceRequestDialog';

const typeLabels = {
  electric: 'Điện',
  water: 'Nước',
  internet: 'Internet',
  other: 'Khác'
};
const statusLabels = {
  new: 'Mới',
  in_progress: 'Đang xử lý',
  done: 'Hoàn thành'
};

const MaintenanceRequestList = ({ rooms = [] }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRoom, setFilterRoom] = useState('all');

  const fetchRequests = () => {
    setLoading(true);
    maintenanceService.getRequests()
      .then(data => setRequests(data))
      .catch(() => setError('Lỗi khi lấy yêu cầu bảo trì'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) return;
    await maintenanceService.deleteRequest(id);
    fetchRequests();
  };

  const filtered = requests.filter(r =>
    (filterType === 'all' || r.type === filterType) &&
    (filterStatus === 'all' || r.status === filterStatus) &&
    (filterRoom === 'all' || r.roomId === filterRoom)
  );

  return (
    <Card className="mt-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <b>Yêu cầu bảo trì</b>
        <Button size="sm" onClick={() => { setSelectedRequest(null); setShowDialog(true); }}>Tạo mới</Button>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="d-flex mb-2 gap-2">
          <Dropdown onSelect={setFilterType}>
            <Dropdown.Toggle size="sm" variant="outline-secondary">
              {filterType === 'all' ? 'Tất cả loại' : typeLabels[filterType]}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="all">Tất cả loại</Dropdown.Item>
              {Object.entries(typeLabels).map(([k, v]) => (
                <Dropdown.Item key={k} eventKey={k}>{v}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          <Dropdown onSelect={setFilterStatus}>
            <Dropdown.Toggle size="sm" variant="outline-secondary">
              {filterStatus === 'all' ? 'Tất cả trạng thái' : statusLabels[filterStatus]}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="all">Tất cả trạng thái</Dropdown.Item>
              {Object.entries(statusLabels).map(([k, v]) => (
                <Dropdown.Item key={k} eventKey={k}>{v}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
          {rooms.length > 0 && (
            <Dropdown onSelect={setFilterRoom}>
              <Dropdown.Toggle size="sm" variant="outline-secondary">
                {filterRoom === 'all' ? 'Tất cả phòng' : rooms.find(r => r.id === filterRoom)?.name || ''}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item eventKey="all">Tất cả phòng</Dropdown.Item>
                {rooms.map(r => (
                  <Dropdown.Item key={r.id} eventKey={r.id}>{r.name}</Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>
        {loading ? <Spinner animation="border" /> : (
          <Table bordered hover size="sm">
            <thead>
              <tr>
                <th>Tiêu đề</th>
                <th>Loại</th>
                <th>Phòng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td>{r.title}</td>
                  <td>{typeLabels[r.type]}</td>
                  <td>{rooms.find(room => room.id === r.roomId)?.name || '-'}</td>
                  <td>{statusLabels[r.status]}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => { setSelectedRequest(r); setShowDialog(true); }}>Sửa</Button>{' '}
                    <Button size="sm" variant="outline-danger" onClick={() => handleDelete(r.id)}>Xóa</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
        <MaintenanceRequestDialog
          show={showDialog}
          onHide={() => { setShowDialog(false); setSelectedRequest(null); }}
          request={selectedRequest}
          onSave={fetchRequests}
          rooms={rooms}
        />
      </Card.Body>
    </Card>
  );
};

export default MaintenanceRequestList; 