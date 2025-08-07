import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Modal, Spinner, Badge, Pagination } from 'react-bootstrap';
import { FaChartLine, FaPlus, FaTrash } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import priceHistoryService from '../services/priceHistoryService';
import accommodationService from '../services/accommodationService';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTimezone } from '../contexts/TimezoneContext';

const PriceHistoryManagement = ({ isActive }) => {
  const [priceHistories, setPriceHistories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    accommodationId: ''
  });

  // Modal states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    accommodationId: '',
    oldPrice: '',
    newPrice: '',
    note: ''
  });

  // Options for dropdowns
  const [accommodations, setAccommodations] = useState([]);

  // Pagination
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { formatCurrency } = useCurrency();
  const { formatDateTime } = useTimezone();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await priceHistoryService.getPriceHistories(filters);
      setPriceHistories(data.priceHistories);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      setError('Lỗi khi tải lịch sử giá');
      console.error('Error fetching price histories:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isActive) {
      fetchData();
      fetchOptions();
    }
  }, [fetchData, isActive]);

  const fetchOptions = async () => {
    try {
      const accommodationsData = await accommodationService.getAccommodations();
      setAccommodations(accommodationsData.accommodations || []);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleFormChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      accommodationId: '',
      oldPrice: '',
      newPrice: '',
      note: ''
    });
  };

  const openCreateModal = () => {
    resetForm();
    setSelectedAccommodation(null);
    setShowHistoryModal(true);
  };

  const openChartModal = async (accommodation) => {
    try {
      setSelectedAccommodation(accommodation);
      
      // Lấy lịch sử giá cho accommodation này
      const historyData = await priceHistoryService.getPriceHistories({
        accommodationId: accommodation.id,
        limit: 100 // Lấy nhiều hơn để có dữ liệu biểu đồ
      });

      // Chuẩn bị dữ liệu cho biểu đồ
      const chartData = historyData.priceHistories.map(item => ({
        date: new Date(item.changedAt).toLocaleDateString('vi-VN'),
        price: parseFloat(item.newPrice),
        oldPrice: parseFloat(item.oldPrice)
      }));

      // Thêm giá hiện tại
      chartData.push({
        date: 'Hiện tại',
        price: parseFloat(accommodation.price),
        oldPrice: chartData.length > 0 ? chartData[chartData.length - 1].price : parseFloat(accommodation.price)
      });

      setChartData(chartData);
      setShowHistoryModal(true);
    } catch (error) {
      setError('Lỗi khi tải dữ liệu biểu đồ');
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await priceHistoryService.createPriceHistory(formData);
      setSuccess('Tạo lịch sử giá thành công!');

      setShowHistoryModal(false);
      fetchData();
    } catch (error) {
      setError(error.response?.data?.error || 'Lỗi khi lưu lịch sử giá');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (history) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch sử giá này?')) {
      try {
        await priceHistoryService.deletePriceHistory(history.id);
        setSuccess('Xóa lịch sử giá thành công!');
        fetchData();
      } catch (error) {
        setError('Lỗi khi xóa lịch sử giá');
      }
    }
  };

  const getPriceChangeBadge = (oldPrice, newPrice) => {
    const change = newPrice - oldPrice;
    const percentage = ((change / oldPrice) * 100).toFixed(1);
    
    if (change > 0) {
      return <Badge bg="danger">+{percentage}%</Badge>;
    } else if (change < 0) {
      return <Badge bg="success">{percentage}%</Badge>;
    } else {
      return <Badge bg="secondary">0%</Badge>;
    }
  };

  if (loading && priceHistories.length === 0) {
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
                <FaChartLine className="me-2" />
                Quản lý lịch sử giá
              </h5>
              <Button variant="primary" onClick={openCreateModal}>
                <FaPlus className="me-2" />
                Thêm lịch sử giá
              </Button>
            </Card.Header>
            <Card.Body>
              {/* Filters */}
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Select
                    value={filters.accommodationId}
                    onChange={(e) => handleFilterChange('accommodationId', e.target.value)}
                  >
                    <option value="">Tất cả nhà trọ</option>
                    {accommodations.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.title}</option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>

              {/* Price Histories Table */}
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nhà trọ</th>
                      <th>Giá cũ</th>
                      <th>Giá mới</th>
                      <th>Thay đổi</th>
                      <th>Ngày thay đổi</th>
                      <th>Người thay đổi</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceHistories.map((history, index) => (
                      <tr key={history.id}>
                        <td>{(filters.page - 1) * filters.limit + index + 1}</td>
                        <td>
                          {history.accommodation?.title}
                          <br />
                          <small className="text-muted">{history.accommodation?.address}</small>
                        </td>
                        <td>{formatCurrency(history.oldPrice)}</td>
                        <td>{formatCurrency(history.newPrice)}</td>
                        <td>{getPriceChangeBadge(history.oldPrice, history.newPrice)}</td>
                        <td>{formatDateTime(history.changedAt, { dateStyle: 'short', timeStyle: 'short' })}</td>
                        <td>
                          {history.changedByUser?.username || 'Hệ thống'}
                          <br />
                          <small className="text-muted">{history.changedByUser?.email}</small>
                        </td>
                        <td>
                          <Button 
                            size="sm" 
                            variant="outline-info"
                            className="me-1"
                            onClick={() => openChartModal(history.accommodation)}
                          >
                            <FaChartLine />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline-danger"
                            onClick={() => handleDelete(history)}
                          >
                            <FaTrash />
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
                      trong tổng số {total} lịch sử giá
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

      {/* Price History Form Modal */}
      <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedAccommodation ? 'Biểu đồ xu hướng giá' : 'Thêm lịch sử giá'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAccommodation ? (
            // Hiển thị biểu đồ
            <div>
              <h6>Xu hướng giá: {selectedAccommodation.title}</h6>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Giá mới"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="oldPrice" 
                    stroke="#82ca9d" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="Giá cũ"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            // Form thêm lịch sử giá
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nhà trọ *</Form.Label>
                  <Form.Select
                    value={formData.accommodationId}
                    onChange={(e) => handleFormChange('accommodationId', e.target.value)}
                    required
                  >
                    <option value="">Chọn nhà trọ</option>
                    {accommodations.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.title}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá cũ *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.oldPrice}
                    onChange={(e) => handleFormChange('oldPrice', e.target.value)}
                    placeholder="Giá cũ"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá mới *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.newPrice}
                    onChange={(e) => handleFormChange('newPrice', e.target.value)}
                    placeholder="Giá mới"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ghi chú</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.note}
                    onChange={(e) => handleFormChange('note', e.target.value)}
                    placeholder="Ghi chú về thay đổi giá"
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowHistoryModal(false);
            setSelectedAccommodation(null);
          }}>
            Đóng
          </Button>
          {!selectedAccommodation && (
            <Button variant="primary" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Thêm'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PriceHistoryManagement; 