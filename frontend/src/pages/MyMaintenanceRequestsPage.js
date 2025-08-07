import React, { useState, useEffect, useCallback } from 'react';
import { Container, Button, ListGroup, Card, Spinner, Alert, Badge } from 'react-bootstrap';
import maintenanceService from '../services/maintenanceService';
import MaintenanceRequestDialog from '../components/MaintenanceRequestDialog'; // Assuming this will be created
import MainLayout from '../layouts/MainLayout';

const getStatusBadge = (status) => {
  const map = {
    'Pending': 'warning',
    'In Progress': 'primary',
    'Completed': 'success',
    'Cancelled': 'secondary',
  };
  return map[status] || 'secondary';
};

const getPriorityBadge = (priority) => {
    const map = {
      'Low': 'info',
      'Medium': 'warning',
      'High': 'danger',
    };
    return map[priority] || 'info';
  };

const MyMaintenanceRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await maintenanceService.getRequests();
      setRequests(data);
    } catch (err) {
      setError('Failed to fetch maintenance requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  return (
    <MainLayout>
      <Container className="mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Yêu cầu Bảo trì của tôi</h2>
          <Button onClick={() => setShowDialog(true)}>Tạo yêu cầu mới</Button>
        </div>

        {loading && <div className="text-center"><Spinner animation="border" /></div>}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loading && !error && (
          <Card>
            <ListGroup variant="flush">
              {requests.length > 0 ? requests.map(req => (
                <ListGroup.Item key={req.id} className="d-flex justify-content-between align-items-start flex-wrap">
                  <div className="me-auto">
                    <h5>{req.title}</h5>
                    <p className="mb-1 text-muted">
                      {req.accommodation?.title || 'N/A'} - {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="d-flex align-items-center">
                     <Badge bg={getPriorityBadge(req.priority)} className="me-2">{req.priority}</Badge>
                     <Badge bg={getStatusBadge(req.status)}>{req.status}</Badge>
                  </div>
                </ListGroup.Item>
              )) : (
                <ListGroup.Item>Bạn chưa có yêu cầu bảo trì nào.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        )}
        
        <MaintenanceRequestDialog 
            show={showDialog}
            onHide={() => setShowDialog(false)}
            onSuccess={() => {
                setShowDialog(false);
                fetchRequests();
            }}
        />
      </Container>
    </MainLayout>
  );
};

export default MyMaintenanceRequestsPage; 