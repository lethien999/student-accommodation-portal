import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Modal, Badge } from 'react-bootstrap';
import { FaTools, FaPlus, FaEdit, FaTrash, FaHome, FaCheck, FaTimes } from 'react-icons/fa';
import amenityService from '../services/amenityService';
import accommodationService from '../services/accommodationService';

const AmenityManagement = ({ isActive }) => {
  const [amenities, setAmenities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: '', description: '' });
  const [selectedAmenity, setSelectedAmenity] = useState(null);

  // Gán tiện ích cho accommodation
  const [accommodations, setAccommodations] = useState([]);
  const [selectedAccommodation, setSelectedAccommodation] = useState('');
  const [accommodationAmenities, setAccommodationAmenities] = useState([]);

  useEffect(() => {
    if (isActive) {
      fetchAmenities();
      fetchAccommodations();
    }
  }, [isActive]);

  const fetchAmenities = async () => {
    try {
      const data = await amenityService.getAmenities();
      setAmenities(data);
    } catch (error) {
      setError('Lỗi khi tải danh sách tiện ích');
    }
  };

  const fetchAccommodations = async () => {
    try {
      const data = await accommodationService.getAccommodations();
      setAccommodations(data.accommodations || []);
    } catch (error) {
      // ignore
    }
  };

  const fetchAccommodationAmenities = async (accommodationId) => {
    try {
      const data = await amenityService.getAccommodationAmenities(accommodationId);
      setAccommodationAmenities(data);
    } catch (error) {
      setAccommodationAmenities([]);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: '', icon: '', description: '' });
    setIsEditing(false);
    setShowModal(true);
  };

  const openEditModal = (amenity) => {
    setFormData({ name: amenity.name, icon: amenity.icon, description: amenity.description });
    setSelectedAmenity(amenity);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleFormChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      if (isEditing) {
        await amenityService.updateAmenity(selectedAmenity.id, formData);
        setSuccess('Cập nhật tiện ích thành công!');
      } else {
        await amenityService.createAmenity(formData);
        setSuccess('Tạo tiện ích thành công!');
      }
      setShowModal(false);
      fetchAmenities();
    } catch (error) {
      setError(error.response?.data?.error || 'Lỗi khi lưu tiện ích');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (amenity) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tiện ích này?')) {
      try {
        await amenityService.deleteAmenity(amenity.id);
        setSuccess('Xóa tiện ích thành công!');
        fetchAmenities();
      } catch (error) {
        setError('Lỗi khi xóa tiện ích');
      }
    }
  };

  // Gán tiện ích cho accommodation
  const openAssignModal = (accommodationId) => {
    setSelectedAccommodation(accommodationId);
    fetchAccommodationAmenities(accommodationId);
  };

  const handleAssignAmenity = async (amenityId) => {
    try {
      await amenityService.addAmenityToAccommodation(selectedAccommodation, amenityId);
      fetchAccommodationAmenities(selectedAccommodation);
    } catch (error) {
      setError('Lỗi khi gán tiện ích');
    }
  };

  const handleRemoveAmenity = async (amenityId) => {
    try {
      await amenityService.removeAmenityFromAccommodation(selectedAccommodation, amenityId);
      fetchAccommodationAmenities(selectedAccommodation);
    } catch (error) {
      setError('Lỗi khi xóa tiện ích khỏi nhà trọ');
    }
  };

  return (
    <Container fluid className="mt-4">
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaTools className="me-2" />
                Quản lý tiện ích
              </h5>
              <Button variant="primary" onClick={openCreateModal}>
                <FaPlus className="me-2" />
                Thêm tiện ích
              </Button>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tên tiện ích</th>
                      <th>Icon</th>
                      <th>Mô tả</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amenities.map((amenity, idx) => (
                      <tr key={amenity.id}>
                        <td>{idx + 1}</td>
                        <td>{amenity.name}</td>
                        <td>{amenity.icon}</td>
                        <td>{amenity.description}</td>
                        <td>
                          <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEditModal(amenity)}><FaEdit /></Button>
                          <Button size="sm" variant="outline-danger" className="me-1" onClick={() => handleDelete(amenity)}><FaTrash /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <FaHome className="me-2" />
                Gán tiện ích cho nhà trọ
              </h5>
            </Card.Header>
            <Card.Body>
              <Form.Select
                value={selectedAccommodation}
                onChange={e => openAssignModal(e.target.value)}
                style={{ maxWidth: 400 }}
              >
                <option value="">Chọn nhà trọ để gán tiện ích</option>
                {accommodations.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.title}</option>
                ))}
              </Form.Select>
              {selectedAccommodation && (
                <div className="mt-3">
                  <h6>Tiện ích đã gán:</h6>
                  {accommodationAmenities.length === 0 && <div>Chưa có tiện ích nào.</div>}
                  <div className="d-flex flex-wrap gap-2">
                    {accommodationAmenities.map(amenity => (
                      <Badge key={amenity.id} bg="info" className="d-flex align-items-center">
                        {amenity.name}
                        <Button size="sm" variant="link" className="ms-1 p-0 text-danger" onClick={() => handleRemoveAmenity(amenity.id)}><FaTimes /></Button>
                      </Badge>
                    ))}
                  </div>
                  <h6 className="mt-3">Thêm tiện ích:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {amenities.filter(a => !accommodationAmenities.some(aa => aa.id === a.id)).map(amenity => (
                      <Badge key={amenity.id} bg="secondary" className="d-flex align-items-center">
                        {amenity.name}
                        <Button size="sm" variant="link" className="ms-1 p-0 text-success" onClick={() => handleAssignAmenity(amenity.id)}><FaCheck /></Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Modal tiện ích */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Cập nhật tiện ích' : 'Thêm tiện ích mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Tên tiện ích *</Form.Label>
            <Form.Control
              type="text"
              value={formData.name}
              onChange={e => handleFormChange('name', e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Icon (tên icon Material hoặc FontAwesome)</Form.Label>
            <Form.Control
              type="text"
              value={formData.icon}
              onChange={e => handleFormChange('icon', e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mô tả</Form.Label>
            <Form.Control
              type="text"
              value={formData.description}
              onChange={e => handleFormChange('description', e.target.value)}
            />
          </Form.Group>
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

export default AmenityManagement; 