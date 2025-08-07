import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Spinner, Alert, Button, Modal, Form, Image, Badge } from 'react-bootstrap';
import { FaEye, FaEdit, FaTrash, FaImage } from 'react-icons/fa';
import maintenanceService from '../services/maintenanceService';
import MainLayout from '../layouts/MainLayout';
import {
  Typography,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid
} from '@mui/material';
import { format } from 'date-fns';

const STATUS_TYPES = ['Pending', 'In Progress', 'Completed', 'Cancelled'];
const PRIORITY_COLORS = {
  'Low': 'success',
  'Medium': 'warning', 
  'High': 'danger'
};

const MaintenanceManagementPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await maintenanceService.getRequests();
      setRequests(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch maintenance requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleUpdateStatus = async () => {
    if (!newStatus || !selectedRequest) return;
    setLoading(true);
    try {
      await maintenanceService.updateRequest(selectedRequest.id, { status: newStatus });
      setShowDialog(false);
      fetchRequests(); // Refresh list
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu bảo trì này?')) return;
    
    setLoading(true);
    try {
      await maintenanceService.deleteRequest(id);
      fetchRequests(); // Refresh list
    } catch (err) {
      setError(err.message || 'Failed to delete request.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetailDialog(true);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'In Progress': return 'info';
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  if (loading && requests.length === 0) {
    return (
      <MainLayout>
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container>
        <Typography variant="h4" gutterBottom>
          Quản lý Yêu cầu Bảo trì
        </Typography>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {error}
          </Alert>
        )}

        <Paper sx={{ mt: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tiêu đề</TableCell>
                  <TableCell>Nhà trọ</TableCell>
                  <TableCell>Người tạo</TableCell>
                  <TableCell>Mức độ</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell>Ảnh</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {request.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.description?.substring(0, 50)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {request.accommodation?.title || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {request.tenant?.username || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge bg={PRIORITY_COLORS[request.priority] || 'secondary'}>
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge bg={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(request.createdAt)}
                    </TableCell>
                    <TableCell>
                      {request.images && request.images.length > 0 ? (
                        <Badge bg="info">
                          <FaImage className="me-1" />
                          {request.images.length} ảnh
                        </Badge>
                      ) : (
                        <span className="text-muted">Không có ảnh</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(request)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDialog(true);
                        }}
                        title="Cập nhật trạng thái"
                      >
                        <FaEdit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteRequest(request.id)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Status Update Dialog */}
        <Modal show={showDialog} onHide={() => setShowDialog(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Cập nhật Trạng thái</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Trạng thái mới</Form.Label>
              <Form.Select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="">Chọn trạng thái...</option>
                {STATUS_TYPES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDialog(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleUpdateStatus} disabled={!newStatus}>
              Cập nhật
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Detail Dialog */}
        <Dialog
          open={showDetailDialog}
          onClose={() => setShowDetailDialog(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedRequest && (
            <>
              <DialogTitle>
                Chi tiết Yêu cầu Bảo trì
                <Badge bg={getStatusColor(selectedRequest.status)} className="ms-2">
                  {selectedRequest.status}
                </Badge>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Typography variant="h6">{selectedRequest.title}</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                      {selectedRequest.description}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nhà trọ:
                    </Typography>
                    <Typography variant="body2">
                      {selectedRequest.accommodation?.title || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Người tạo:
                    </Typography>
                    <Typography variant="body2">
                      {selectedRequest.tenant?.username || 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mức độ ưu tiên:
                    </Typography>
                    <Badge bg={PRIORITY_COLORS[selectedRequest.priority] || 'secondary'}>
                      {selectedRequest.priority}
                    </Badge>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ngày tạo:
                    </Typography>
                    <Typography variant="body2">
                      {formatDate(selectedRequest.createdAt)}
                    </Typography>
                  </Grid>

                  {/* Images Section */}
                  {selectedRequest.images && selectedRequest.images.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Ảnh minh họa ({selectedRequest.images.length} ảnh):
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedRequest.images.map((image, index) => (
                          <Box
                            key={index}
                            sx={{
                              width: 150,
                              height: 150,
                              position: 'relative',
                              border: '1px solid #ddd',
                              borderRadius: 1,
                              overflow: 'hidden'
                            }}
                          >
                            <Image
                              src={image.url}
                              alt={`Ảnh ${index + 1}`}
                              fluid
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowDetailDialog(false)}>
                  Đóng
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </MainLayout>
  );
};

export default MaintenanceManagementPage; 