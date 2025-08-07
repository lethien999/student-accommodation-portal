import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Modal, Badge, Spinner } from 'react-bootstrap';
import { FaNewspaper, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import newsService from '../services/newsService';

const NewsManagement = ({ isActive }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: '',
    status: 'draft'
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

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await newsService.getNews(filters);
      setNews(data.news || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      setError('Lỗi khi tải danh sách tin tức');
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (isActive) {
      fetchNews();
    }
  }, [fetchNews, isActive]);

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
      content: '',
      summary: '',
      category: '',
      status: 'draft'
    });
    setIsEditing(false);
    setSelectedNews(null);
    setShowModal(true);
  };

  const openEditModal = (newsItem) => {
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      summary: newsItem.summary,
      category: newsItem.category,
      status: newsItem.status
    });
    setSelectedNews(newsItem);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (isEditing) {
        await newsService.updateNews(selectedNews.id, formData);
        setSuccess('Cập nhật tin tức thành công!');
      } else {
        await newsService.createNews(formData);
        setSuccess('Tạo tin tức thành công!');
      }

      setShowModal(false);
      fetchNews();
    } catch (error) {
      setError(error.response?.data?.error || 'Lỗi khi lưu tin tức');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (newsItem) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tin tức này?')) {
      try {
        await newsService.deleteNews(newsItem.id);
        setSuccess('Xóa tin tức thành công!');
        fetchNews();
      } catch (error) {
        setError('Lỗi khi xóa tin tức');
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

  if (loading && news.length === 0) {
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
                <FaNewspaper className="me-2" />
                Quản lý tin tức
              </h5>
              <Button variant="primary" onClick={openCreateModal}>
                <FaPlus className="me-2" />
                Thêm tin tức
              </Button>
            </Card.Header>
            <Card.Body>
              {/* Filters */}
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Control
                    placeholder="Tìm kiếm tin tức..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </Col>
                <Col md={2}>
                  <Form.Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">Tất cả danh mục</option>
                    <option value="general">Tin chung</option>
                    <option value="housing">Nhà ở</option>
                    <option value="market">Thị trường</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
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

              {/* News Table */}
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tiêu đề</th>
                      <th>Danh mục</th>
                      <th>Trạng thái</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {news.map((newsItem, idx) => (
                      <tr key={newsItem.id}>
                        <td>{(filters.page - 1) * filters.limit + idx + 1}</td>
                        <td>{newsItem.title}</td>
                        <td>{newsItem.category}</td>
                        <td>{getStatusBadge(newsItem.status)}</td>
                        <td>{new Date(newsItem.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>
                          <Button size="sm" variant="outline-info" className="me-1">
                            <FaEye />
                          </Button>
                          <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEditModal(newsItem)}>
                            <FaEdit />
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(newsItem)}>
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
                      trong tổng số {total} tin tức
                    </small>
                  </div>
                  <div>
                    <Button 
                      size="sm" 
                      disabled={filters.page === 1}
                      onClick={() => handleFilterChange('page', filters.page - 1)}
                    >
                      Trước
                    </Button>
                    <span className="mx-2">Trang {filters.page} / {totalPages}</span>
                    <Button 
                      size="sm" 
                      disabled={filters.page >= totalPages}
                      onClick={() => handleFilterChange('page', filters.page + 1)}
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

      {/* News Form Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? 'Cập nhật tin tức' : 'Tạo tin tức mới'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề *</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="Nhập tiêu đề tin tức"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tóm tắt</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.summary}
                onChange={(e) => handleFormChange('summary', e.target.value)}
                placeholder="Tóm tắt tin tức"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Select
                    value={formData.category}
                    onChange={(e) => handleFormChange('category', e.target.value)}
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="general">Tin chung</option>
                    <option value="housing">Nhà ở</option>
                    <option value="market">Thị trường</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Trạng thái</Form.Label>
                  <Form.Select
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <option value="draft">Bản nháp</option>
                    <option value="published">Xuất bản</option>
                    <option value="archived">Lưu trữ</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Nội dung *</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                value={formData.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                placeholder="Nhập nội dung tin tức"
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

export default NewsManagement; 