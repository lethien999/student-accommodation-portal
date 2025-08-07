import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Alert, Modal, Spinner } from 'react-bootstrap';
import { FaEye, FaCheck, FaTimes, FaFilter, FaTrash } from 'react-icons/fa';
import reportService from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { useTimezone } from '../contexts/TimezoneContext';

const ReportManagementPage = ({ isActive }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    targetType: '',
    reason: '',
    dateFrom: '',
    dateTo: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);

  const { formatDateTime } = useTimezone();

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
        ...filters
      };
      const data = await reportService.getReports(params);
      setReports(data.reports || []);
      setTotalPages(data.totalPages || 1);
      setTotalReports(data.total || 0);
    } catch (error) {
      setError('Lỗi khi tải danh sách báo cáo');
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    if (isActive) {
      fetchReports();
    }
  }, [fetchReports, isActive]);

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      setProcessing(true);
      await reportService.updateReportStatus(reportId, newStatus);
      setSuccess(`Cập nhật trạng thái báo cáo thành công!`);
      fetchReports();
    } catch (error) {
      setError('Lỗi khi cập nhật trạng thái báo cáo');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    
    try {
      setProcessing(true);
      await reportService.deleteReport(selectedReport.id);
      setSuccess('Xóa báo cáo thành công!');
      setShowDeleteModal(false);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      setError('Lỗi khi xóa báo cáo');
    } finally {
      setProcessing(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      resolved: 'success',
      rejected: 'danger'
    };
    const labels = {
      pending: 'Chờ xử lý',
      resolved: 'Đã xử lý',
      rejected: 'Từ chối'
    };
    return <Badge bg={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  const getTargetTypeLabel = (type) => {
    const labels = {
      accommodation: 'Nhà trọ',
      review: 'Đánh giá',
      user: 'Người dùng',
      advertisement: 'Quảng cáo'
    };
    return labels[type] || type;
  };

  const getReasonLabel = (reason) => {
    const labels = {
      spam: 'Spam',
      inappropriate: 'Nội dung không phù hợp',
      fraud: 'Lừa đảo',
      other: 'Khác'
    };
    return labels[reason] || reason;
  };

  if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Bạn không có quyền truy cập trang này</Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Quản lý báo cáo - Student Accommodation Portal</title>
        <meta name="description" content="Quản lý và xử lý các báo cáo vi phạm từ người dùng" />
      </Helmet>

      <Container fluid className="mt-4">
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">Quản lý báo cáo ({totalReports})</h4>
                  <Button variant="outline-primary" onClick={fetchReports}>
                    <FaFilter className="me-2" />
                    Làm mới
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
                {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

                {/* Filters */}
                <Row className="mb-3">
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Trạng thái</Form.Label>
                      <Form.Select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                      >
                        <option value="">Tất cả</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="resolved">Đã xử lý</option>
                        <option value="rejected">Từ chối</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Loại báo cáo</Form.Label>
                      <Form.Select
                        value={filters.targetType}
                        onChange={(e) => handleFilterChange('targetType', e.target.value)}
                      >
                        <option value="">Tất cả</option>
                        <option value="accommodation">Nhà trọ</option>
                        <option value="review">Đánh giá</option>
                        <option value="user">Người dùng</option>
                        <option value="advertisement">Quảng cáo</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Lý do</Form.Label>
                      <Form.Select
                        value={filters.reason}
                        onChange={(e) => handleFilterChange('reason', e.target.value)}
                      >
                        <option value="">Tất cả</option>
                        <option value="spam">Spam</option>
                        <option value="inappropriate">Không phù hợp</option>
                        <option value="fraud">Lừa đảo</option>
                        <option value="other">Khác</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Từ ngày</Form.Label>
                      <Form.Control
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label>Đến ngày</Form.Label>
                      <Form.Control
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Reports Table */}
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : (
                  <Table responsive striped hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Loại</th>
                        <th>Lý do</th>
                        <th>Người báo cáo</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report.id}>
                          <td>#{report.id}</td>
                          <td>
                            <Badge bg="info">{getTargetTypeLabel(report.targetType)}</Badge>
                          </td>
                          <td>{getReasonLabel(report.reason)}</td>
                          <td>{report.user?.username || 'N/A'}</td>
                          <td>{getStatusBadge(report.status)}</td>
                          <td>{formatDateTime(report.createdAt, { dateStyle: 'short', timeStyle: 'short' })}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => {
                                  setSelectedReport(report);
                                  setShowDetailModal(true);
                                }}
                              >
                                <FaEye />
                              </Button>
                              {report.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline-success"
                                    onClick={() => handleStatusUpdate(report.id, 'resolved')}
                                    disabled={processing}
                                  >
                                    <FaCheck />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline-danger"
                                    onClick={() => handleStatusUpdate(report.id, 'rejected')}
                                    disabled={processing}
                                  >
                                    <FaTimes />
                                  </Button>
                                </>
                              )}
                              {user.role === 'admin' && (
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => {
                                    setSelectedReport(report);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <FaTrash />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center mt-3">
                    <Button
                      variant="outline-primary"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="me-2"
                    >
                      Trước
                    </Button>
                    <span className="mx-3 d-flex align-items-center">
                      Trang {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline-primary"
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="ms-2"
                    >
                      Sau
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Report Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết báo cáo #{selectedReport?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReport && (
            <div>
              <Row>
                <Col md={6}>
                  <p><strong>Loại báo cáo:</strong> {getTargetTypeLabel(selectedReport.targetType)}</p>
                  <p><strong>Lý do:</strong> {getReasonLabel(selectedReport.reason)}</p>
                  <p><strong>Trạng thái:</strong> {getStatusBadge(selectedReport.status)}</p>
                  <p><strong>Người báo cáo:</strong> {selectedReport.user?.username || 'N/A'}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Ngày tạo:</strong> {formatDateTime(selectedReport.createdAt, { dateStyle: 'short', timeStyle: 'short' })}</p>
                  <p><strong>Cập nhật lần cuối:</strong> {formatDateTime(selectedReport.updatedAt, { dateStyle: 'short', timeStyle: 'short' })}</p>
                </Col>
              </Row>
              <hr />
              <div>
                <h6>Chi tiết báo cáo:</h6>
                <p>{selectedReport.details || 'Không có chi tiết'}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa báo cáo này? Hành động này không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteReport} disabled={processing}>
            {processing ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ReportManagementPage; 