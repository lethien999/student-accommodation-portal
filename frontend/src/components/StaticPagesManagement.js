import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Modal, Badge, Spinner } from 'react-bootstrap';
import { FaFileAlt, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import staticPageService from '../services/staticPageService';

const StaticPagesManagement = ({ isActive }) => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    status: 'published'
  });

  // Filter states
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: ''
  });

  // Pagination
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await staticPageService.getStaticPages(filters);
      setPages(data.pages || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      setError('Lỗi khi tải danh sách trang tĩnh');
      console.error('Error fetching pages:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isActive) {
      fetchPages();
    }
  }, [fetchPages, isActive]);

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
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      status: 'published'
    });
    setIsEditing(false);
    setSelectedPage(null);
    setShowModal(true);
  };

  const openEditModal = (page) => {
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      status: page.status
    });
    setSelectedPage(page);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (isEditing) {
        await staticPageService.updateStaticPage(selectedPage.id, formData);
        setSuccess('Cập nhật trang tĩnh thành công!');
      } else {
        await staticPageService.createStaticPage(formData);
        setSuccess('Tạo trang tĩnh thành công!');
      }

      setShowModal(false);
      fetchPages();
    } catch (error) {
      setError(error.response?.data?.error || 'Lỗi khi lưu trang tĩnh');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (page) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa trang tĩnh này?')) {
      try {
        await staticPageService.deleteStaticPage(page.id);
        setSuccess('Xóa trang tĩnh thành công!');
        fetchPages();
      } catch (error) {
        setError('Lỗi khi xóa trang tĩnh');
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

  if (loading && pages.length === 0) {
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
                <FaFileAlt className="me-2" />
                Quản lý trang tĩnh
              </h5>
              <Button variant="primary" onClick={openCreateModal}>
                <FaPlus className="me-2" />
                Thêm trang
              </Button>
            </Card.Header>
            <Card.Body>
              {/* Filters */}
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Control
                    placeholder="Tìm kiếm trang..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
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

              {/* Pages Table */}
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tiêu đề</th>
                      <th>Slug</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pages.map((page, idx) => (
                      <tr key={page.id}>
                        <td>{(filters.page - 1) * filters.limit + idx + 1}</td>
                        <td>{page.title}</td>
                        <td><code>{page.slug}</code></td>
                        <td>{getStatusBadge(page.status)}</td>
                        <td>{new Date(page.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <Button size="sm" variant="outline-info" className="me-1">
                            <FaEye />
                          </Button>
                          <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEditModal(page)}>
                            <FaEdit />
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(page)}>
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
                      trong tổng số {total} trang
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
          <Modal.Title>{isEditing ? 'Cập nhật trang tĩnh' : 'Thêm trang tĩnh mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Tiêu đề *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFormChange('title', e.target.value)}
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
            <Form.Group className="mb-3">
              <Form.Label>Slug *</Form.Label>
              <Form.Control
                type="text"
                value={formData.slug}
                onChange={(e) => handleFormChange('slug', e.target.value)}
                placeholder="about-us, terms-of-service, etc."
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nội dung *</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                value={formData.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                required
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Meta Title</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) => handleFormChange('metaTitle', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Meta Description</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.metaDescription}
                    onChange={(e) => handleFormChange('metaDescription', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
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

export default StaticPagesManagement; 