import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { FaChartLine, FaDownload, FaFilter, FaCalendar, FaMoneyBillWave, FaUsers, FaHome, FaPercent } from 'react-icons/fa';
import adminService from '../services/adminService';
import { useCurrency } from '../contexts/CurrencyContext';

const RevenueManagement = ({ isActive }) => {
  const [revenueData, setRevenueData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    period: 'month',
    startDate: '',
    endDate: '',
    type: '',
    status: ''
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const { formatCurrency } = useCurrency();

  const fetchRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getRevenueData(filters);
      setRevenueData(data);
    } catch (error) {
      setError('Lỗi khi tải dữ liệu doanh thu');
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchTransactions = useCallback(async () => {
    try {
      const data = await adminService.getTransactions({
        page,
        ...filters
      });
      setTransactions(data.transactions || []);
      setTotal(data.total || 0);
    } catch (error) {
      setTransactions([]);
      setTotal(0);
    }
  }, [page, filters]);

  useEffect(() => {
    if (isActive) {
      fetchRevenueData();
    }
  }, [isActive, fetchRevenueData]);

  useEffect(() => {
    if (isActive) {
      fetchTransactions();
    }
  }, [isActive, fetchTransactions]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1);
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'success',
      pending: 'warning',
      failed: 'danger',
      refunded: 'info'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getTypeBadge = (type) => {
    const variants = {
      advertisement: 'primary',
      subscription: 'success',
      commission: 'warning',
      other: 'secondary'
    };
    return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading && !revenueData) {
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
      
      {/* Revenue Overview Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaMoneyBillWave size={30} className="text-success mb-2" />
              <h4 className="text-success">
                {revenueData?.currentPeriod?.total ? formatCurrency(revenueData.currentPeriod.total) : '₫0'}
              </h4>
              <p className="text-muted">Doanh thu {filters.period === 'month' ? 'tháng này' : 'năm nay'}</p>
              {revenueData?.currentPeriod?.change && (
                <small className={`${revenueData.currentPeriod.change > 0 ? 'text-success' : 'text-danger'}`}>
                  {formatPercentage(revenueData.currentPeriod.change)} so với kỳ trước
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaUsers size={30} className="text-info mb-2" />
              <h4 className="text-info">
                {revenueData?.currentPeriod?.customers || 0}
              </h4>
              <p className="text-muted">Khách hàng mới</p>
              {revenueData?.currentPeriod?.customerChange && (
                <small className={`${revenueData.currentPeriod.customerChange > 0 ? 'text-success' : 'text-danger'}`}>
                  {formatPercentage(revenueData.currentPeriod.customerChange)} so với kỳ trước
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaHome size={30} className="text-primary mb-2" />
              <h4 className="text-primary">
                {revenueData?.currentPeriod?.transactions || 0}
              </h4>
              <p className="text-muted">Giao dịch</p>
              {revenueData?.currentPeriod?.transactionChange && (
                <small className={`${revenueData.currentPeriod.transactionChange > 0 ? 'text-success' : 'text-danger'}`}>
                  {formatPercentage(revenueData.currentPeriod.transactionChange)} so với kỳ trước
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <FaPercent size={30} className="text-warning mb-2" />
              <h4 className="text-warning">
                {revenueData?.currentPeriod?.conversionRate ? `${revenueData.currentPeriod.conversionRate.toFixed(1)}%` : '0%'}
              </h4>
              <p className="text-muted">Tỷ lệ chuyển đổi</p>
              {revenueData?.currentPeriod?.conversionChange && (
                <small className={`${revenueData.currentPeriod.conversionChange > 0 ? 'text-success' : 'text-danger'}`}>
                  {formatPercentage(revenueData.currentPeriod.conversionChange)} so với kỳ trước
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">
            <FaFilter className="me-2" />
            Bộ lọc
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Kỳ báo cáo</Form.Label>
                <Form.Select
                  value={filters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                >
                  <option value="week">Tuần này</option>
                  <option value="month">Tháng này</option>
                  <option value="quarter">Quý này</option>
                  <option value="year">Năm nay</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Từ ngày</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Đến ngày</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Loại giao dịch</Form.Label>
                <Form.Select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="advertisement">Quảng cáo</option>
                  <option value="subscription">Đăng ký</option>
                  <option value="commission">Hoa hồng</option>
                  <option value="other">Khác</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="pending">Đang xử lý</option>
                  <option value="failed">Thất bại</option>
                  <option value="refunded">Hoàn tiền</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button variant="outline-primary" className="w-100">
                <FaDownload className="me-2" />
                Xuất báo cáo
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Revenue Chart Placeholder */}
      <Card className="mb-4">
        <Card.Header>
          <h6 className="mb-0">
            <FaChartLine className="me-2" />
            Biểu đồ doanh thu
          </h6>
        </Card.Header>
        <Card.Body>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8f9fa' }}>
            <div className="text-center">
              <FaChartLine size={48} className="text-muted mb-3" />
              <p className="text-muted">Biểu đồ doanh thu sẽ được hiển thị ở đây</p>
              <small className="text-muted">Tích hợp với thư viện Chart.js hoặc Recharts</small>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Transactions Table */}
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <FaMoneyBillWave className="me-2" />
            Lịch sử giao dịch
          </h6>
          <div>
            <Button variant="outline-success" size="sm" className="me-2">
              <FaDownload className="me-1" />
              Xuất Excel
            </Button>
            <Button variant="outline-primary" size="sm">
              <FaCalendar className="me-1" />
              Lịch sử
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mã giao dịch</th>
                  <th>Khách hàng</th>
                  <th>Loại</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, idx) => (
                  <tr key={transaction.id}>
                    <td>{(page - 1) * 10 + idx + 1}</td>
                    <td><code>{transaction.transactionId}</code></td>
                    <td>{transaction.customerName}</td>
                    <td>{getTypeBadge(transaction.type)}</td>
                    <td className="fw-bold">{formatCurrency(transaction.amount)}</td>
                    <td>{getStatusBadge(transaction.status)}</td>
                    <td>{new Date(transaction.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <Button size="sm" variant="outline-info">
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {Math.ceil(total / 10) > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div>
                <small>
                  Hiển thị {((page - 1) * 10) + 1} - {Math.min(page * 10, total)} 
                  trong tổng số {total} giao dịch
                </small>
              </div>
              <div>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Trước
                </Button>
                <span className="mx-2">
                  Trang {page} / {Math.ceil(total / 10)}
                </span>
                <Button 
                  variant="outline-secondary" 
                  size="sm" 
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 10)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RevenueManagement; 