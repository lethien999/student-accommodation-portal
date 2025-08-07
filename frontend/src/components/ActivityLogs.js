import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, Row, Col, Card, Button, Table, Form, Alert, 
  Badge, Modal, Pagination, Spinner 
} from 'react-bootstrap';
import { 
  FaHistory, FaDownload, FaTrash, FaEye,
  FaChartBar
} from 'react-icons/fa';
import activityService from '../services/activityService';
import { useTimezone } from '../contexts/TimezoneContext';

const ActivityLogs = ({ userId = null, isActive }) => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 50,
    action: '',
    module: '',
    status: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  // Available options
  const [availableActions, setAvailableActions] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);

  // Modal states
  const [showLogDetail, setShowLogDetail] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(90);

  // Pagination
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { formatDateTime } = useTimezone();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = { ...filters };
      
      let logsData;
      if (userId) {
        logsData = await activityService.getUserActivityLogs(userId, params);
      } else {
        logsData = await activityService.getActivityLogs(params);
      }
      
      setLogs(logsData.logs || []);
      setTotal(logsData.total || 0);
      setTotalPages(logsData.totalPages || 0);
    } catch (error) {
      setError('Lỗi khi tải activity logs');
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, userId]);

  useEffect(() => {
    if (isActive) {
      fetchData();
      fetchOptions();
    }
  }, [fetchData, isActive]);

  const fetchOptions = async () => {
    try {
      const [actions, modules] = await Promise.all([
        activityService.getAvailableActions(),
        activityService.getAvailableModules()
      ]);
      setAvailableActions(actions);
      setAvailableModules(modules);
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await activityService.getActivityStats({
        startDate: filters.startDate,
        endDate: filters.endDate
      });
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filter changes
    }));
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await activityService.exportActivityLogs({
        ...filters,
        format: 'csv'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('Đã xuất file thành công!');
    } catch (error) {
      setError('Lỗi khi xuất file');
      console.error('Error exporting logs:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleCleanup = async () => {
    try {
      await activityService.cleanupOldLogs(cleanupDays);
      setSuccess(`Đã xóa logs cũ hơn ${cleanupDays} ngày thành công!`);
      setShowCleanupModal(false);
      fetchData(); // Reload data
    } catch (error) {
      setError('Lỗi khi cleanup logs');
      console.error('Error cleaning up logs:', error);
    }
  };

  const viewLogDetail = (log) => {
    setSelectedLog(log);
    setShowLogDetail(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      success: 'success',
      failed: 'danger',
      pending: 'warning'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getActionIcon = (action) => {
    const icons = {
      create: '➕',
      update: '✏️',
      delete: '🗑️',
      login: '🔑',
      logout: '🚪',
      view: '👁️',
      download: '⬇️',
      upload: '⬆️'
    };
    return icons[action] || '📝';
  };

  if (loading && logs.length === 0) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
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
              <h5 className="mb-0">
                <FaHistory className="me-2" />
                Activity Logs
                {userId && <Badge bg="info" className="ms-2">User ID: {userId}</Badge>}
              </h5>
              <div>
                <Button 
                  variant="outline-info" 
                  className="me-2"
                  onClick={fetchStats}
                >
                  <FaChartBar className="me-2" />
                  Thống kê
                </Button>
                <Button 
                  variant="outline-warning" 
                  className="me-2"
                  onClick={() => setShowCleanupModal(true)}
                >
                  <FaTrash className="me-2" />
                  Cleanup
                </Button>
                <Button 
                  variant="outline-success" 
                  onClick={handleExport}
                  disabled={exporting}
                >
                  <FaDownload className="me-2" />
                  {exporting ? 'Đang xuất...' : 'Xuất CSV'}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Filters */}
              <Row className="mb-3">
                <Col md={2}>
                  <Form.Control
                    placeholder="Tìm kiếm..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                  >
                    <option value="">Tất cả hành động</option>
                    {availableActions.map(action => (
                      <option key={action} value={action}>{action}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={filters.module}
                    onChange={(e) => handleFilterChange('module', e.target.value)}
                  >
                    <option value="">Tất cả module</option>
                    {availableModules.map(module => (
                      <option key={module} value={module}>{module}</option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="success">Thành công</option>
                    <option value="failed">Thất bại</option>
                    <option value="pending">Đang xử lý</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Form.Control
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </Col>
              </Row>

              {/* Stats */}
              {stats && (
                <Row className="mb-3">
                  <Col>
                    <Card className="bg-light">
                      <Card.Body>
                        <h6>Thống kê</h6>
                        <Row>
                          <Col md={3}>
                            <small>Actions: {stats.actionStats?.length || 0}</small>
                          </Col>
                          <Col md={3}>
                            <small>Modules: {stats.moduleStats?.length || 0}</small>
                          </Col>
                          <Col md={3}>
                            <small>Status: {stats.statusStats?.length || 0}</small>
                          </Col>
                          <Col md={3}>
                            <small>Top Users: {stats.topUsers?.length || 0}</small>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {/* Logs Table */}
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Module</th>
                      <th>Status</th>
                      <th>IP Address</th>
                      <th>Thời gian</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={log.id}>
                        <td>{(filters.page - 1) * filters.limit + index + 1}</td>
                        <td>
                          {log.user?.username || 'N/A'}
                          <br />
                          <small className="text-muted">{log.user?.email}</small>
                        </td>
                        <td>
                          <span className="me-1">{getActionIcon(log.action)}</span>
                          {log.action}
                        </td>
                        <td>
                          <Badge bg="secondary">{log.module}</Badge>
                        </td>
                        <td>{getStatusBadge(log.status)}</td>
                        <td>
                          <small>{log.ipAddress || 'N/A'}</small>
                        </td>
                        <td>
                          {formatDateTime(log.createdAt)}
                        </td>
                        <td>
                          <Button 
                            size="sm" 
                            variant="outline-info"
                            onClick={() => viewLogDetail(log)}
                          >
                            <FaEye />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <small>
                      Hiển thị {((filters.page - 1) * filters.limit) + 1} - {Math.min(filters.page * filters.limit, total)} 
                      trong tổng số {total} logs
                    </small>
                  </div>
                  <Pagination>
                    <Pagination.First 
                      disabled={filters.page === 1}
                      onClick={() => handleFilterChange('page', 1)}
                    />
                    <Pagination.Prev 
                      disabled={filters.page === 1}
                      onClick={() => handleFilterChange('page', filters.page - 1)}
                    />
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, filters.page - 2)) + i;
                      return (
                        <Pagination.Item
                          key={page}
                          active={page === filters.page}
                          onClick={() => handleFilterChange('page', page)}
                        >
                          {page}
                        </Pagination.Item>
                      );
                    })}
                    
                    <Pagination.Next 
                      disabled={filters.page === totalPages}
                      onClick={() => handleFilterChange('page', filters.page + 1)}
                    />
                    <Pagination.Last 
                      disabled={filters.page === totalPages}
                      onClick={() => handleFilterChange('page', totalPages)}
                    />
                  </Pagination>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Log Detail Modal */}
      <Modal show={showLogDetail} onHide={() => setShowLogDetail(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết Activity Log</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedLog && (
            <div>
              <Row>
                <Col md={6}>
                  <strong>User:</strong> {selectedLog.user?.username || 'N/A'}
                  <br />
                  <strong>Email:</strong> {selectedLog.user?.email || 'N/A'}
                  <br />
                  <strong>Action:</strong> {selectedLog.action}
                  <br />
                  <strong>Module:</strong> {selectedLog.module}
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> {getStatusBadge(selectedLog.status)}
                  <br />
                  <strong>IP Address:</strong> {selectedLog.ipAddress || 'N/A'}
                  <br />
                  <strong>Resource ID:</strong> {selectedLog.resourceId || 'N/A'}
                  <br />
                  <strong>Resource Type:</strong> {selectedLog.resourceType || 'N/A'}
                </Col>
              </Row>
              <hr />
              <div>
                <strong>Details:</strong>
                <pre className="bg-light p-2 mt-2" style={{ fontSize: '0.9em' }}>
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
              {selectedLog.errorMessage && (
                <div className="mt-3">
                  <strong>Error Message:</strong>
                  <div className="text-danger bg-light p-2 mt-1">
                    {selectedLog.errorMessage}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogDetail(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cleanup Modal */}
      <Modal show={showCleanupModal} onHide={() => setShowCleanupModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cleanup Activity Logs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có muốn xóa các activity logs cũ không?</p>
          <Form.Group>
            <Form.Label>Số ngày cũ hơn:</Form.Label>
            <Form.Control
              type="number"
              value={cleanupDays}
              onChange={(e) => setCleanupDays(Number(e.target.value))}
              min="1"
              max="365"
            />
            <Form.Text className="text-muted">
              Các logs cũ hơn {cleanupDays} ngày sẽ bị xóa vĩnh viễn.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCleanupModal(false)}>
            Hủy
          </Button>
          <Button variant="warning" onClick={handleCleanup}>
            Xóa logs cũ
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ActivityLogs; 