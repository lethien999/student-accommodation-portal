import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Modal, Badge, Spinner } from 'react-bootstrap';
import { FaQuestionCircle, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import faqService from '../services/faqService';

const FAQManagement = ({ isActive }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    status: 'published',
    order: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    category: '',
    status: ''
  });

  // Pagination
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await faqService.getFaqs(filters);
      setFaqs(data.faqs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      setError('Lỗi khi tải danh sách FAQ');
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isActive) {
      fetchFaqs();
    }
  }, [fetchFaqs, isActive]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handleFormChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const openCreateModal = () => {
    setFormData({
      question: '',
      answer: '',
      category: '',
      status: 'published',
      order: 0
    });
    setIsEditing(false);
    setSelectedFaq(null);
    setShowModal(true);
  };

  const openEditModal = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      status: faq.status,
      order: faq.order || 0
    });
    setSelectedFaq(faq);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (isEditing) {
        await faqService.updateFaq(selectedFaq.id, formData);
        setSuccess('Cập nhật FAQ thành công!');
      } else {
        await faqService.createFaq(formData);
        setSuccess('Tạo FAQ thành công!');
      }

      setShowModal(false);
      fetchFaqs();
    } catch (error) {
      setError(error.response?.data?.error || 'Lỗi khi lưu FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (faq) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa FAQ này?')) {
      try {
        await faqService.deleteFaq(faq.id);
        setSuccess('Xóa FAQ thành công!');
        fetchFaqs();
      } catch (error) {
        setError('Lỗi khi xóa FAQ');
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      published: 'success',
      draft: 'warning',
      archived: 'secondary'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading && faqs.length === 0) {
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
                <FaQuestionCircle className="me-2" />
                Quản lý FAQ
              </h5>
              <Button variant="primary" onClick={openCreateModal}>
                <FaPlus className="me-2" />
                Thêm FAQ
              </Button>
            </Card.Header>
            <Card.Body>
              {/* Filters */}
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Control
                    placeholder="Tìm kiếm FAQ..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <Form.Control
                    placeholder="Danh mục..."
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  />
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="published">Đã xuất bản</option>
                    <option value="draft">Bản nháp</option>
                    <option value="archived">Đã lưu trữ</option>
                  </Form.Select>
                </Col>
              </Row>

              {/* FAQs Table */}
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Câu hỏi</th>
                      <th>Danh mục</th>
                      <th>Thứ tự</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map((faq, idx) => (
                      <tr key={faq.id}>
                        <td>{(filters.page - 1) * filters.limit + idx + 1}</td>
                        <td>
                          <div style={{ maxWidth: '300px' }}>
                            <strong>{faq.question}</strong>
                            <div className="text-muted small mt-1" style={{ 
                              maxHeight: '60px', 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical'
                            }}>
                              {faq.answer}
                            </div>
                          </div>
                        </td>
                        <td>{faq.category || '-'}</td>
                        <td>{faq.order || 0}</td>
                        <td>{getStatusBadge(faq.status)}</td>
                        <td>{new Date(faq.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <Button size="sm" variant="outline-info" className="me-1">
                            <FaEye />
                          </Button>
                          <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEditModal(faq)}>
                            <FaEdit />
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(faq)}>
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
                      trong tổng số {total} FAQ
                    </small>
                  </div>
                  <div>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      onClick={() => handleFilterChange('page', filters.page - 1)}
                      disabled={filters.page === 1}
                    >
                      Trước
                    </Button>
                    <span className="mx-2">
                      Trang {filters.page} / {totalPages}
                    </span>
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      onClick={() => handleFilterChange('page', filters.page + 1)}
                      disabled={filters.page >= totalPages}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Cập nhật FAQ' : 'Thêm FAQ mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Câu hỏi *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.question}
                    onChange={(e) => handleFormChange('question', e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <option value="published">Đã xuất bản</option>
                    <option value="draft">Bản nháp</option>
                    <option value="archived">Đã lưu trữ</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                    placeholder="Chung, Thanh toán, Kỹ thuật..."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Thứ tự hiển thị</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.order}
                    onChange={(e) => handleFormChange('order', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Câu trả lời *</Form.Label>
              <Form.Control
                as="textarea"
                rows={8}
                value={formData.answer}
                onChange={(e) => handleFormChange('answer', e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Tạo')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FAQManagement; 