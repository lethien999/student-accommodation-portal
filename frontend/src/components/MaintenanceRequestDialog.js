import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert, Image, Badge } from 'react-bootstrap';
import { FaUpload, FaTrash, FaEye, FaTimes } from 'react-icons/fa';
import maintenanceService from '../services/maintenanceService';
import rentalContractService from '../services/rentalContractService';

const PRIORITY_LEVELS = ['Low', 'Medium', 'High'];

const MaintenanceRequestDialog = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    accommodationId: ''
  });
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (show) {
      resetForm();
      rentalContractService.getMyActiveContracts()
        .then(data => {
          setContracts(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, accommodationId: data[0].accommodation.id }));
          }
        })
        .catch(() => setError('Could not load your accommodation list.'));
    }
  }, [show]);
  
  const resetForm = () => {
    setFormData({ title: '', description: '', priority: 'Medium', accommodationId: '' });
    setError('');
    setImages([]);
    setImagePreview([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file count
    if (images.length + files.length > 10) {
      setError('Chỉ được tải lên tối đa 10 ảnh');
      return;
    }

    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles = files.filter(file => {
      if (!validTypes.includes(file.type)) {
        setError(`File ${file.name} không đúng định dạng. Chỉ chấp nhận: JPG, PNG, GIF, WEBP`);
        return false;
      }
      if (file.size > maxSize) {
        setError(`File ${file.name} quá lớn. Kích thước tối đa: 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setImages(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, {
          url: e.target.result,
          name: file.name,
          size: file.size
        }]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.accommodationId) {
      setError('Please select an accommodation.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('accommodationId', formData.accommodationId);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('priority', formData.priority);
      
      // Append images
      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      await maintenanceService.createRequest(formDataToSend);
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Tạo Yêu cầu Bảo trì mới</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form.Group className="mb-3">
            <Form.Label>Nhà trọ</Form.Label>
            <Form.Select name="accommodationId" value={formData.accommodationId} onChange={handleInputChange} required>
              <option value="" disabled>-- Chọn nhà trọ --</option>
              {contracts.map(contract => (
                <option key={contract.id} value={contract.accommodation.id}>
                  {contract.accommodation.title}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Tiêu đề</Form.Label>
            <Form.Control type="text" name="title" value={formData.title} onChange={handleInputChange} required />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Mô tả chi tiết</Form.Label>
            <Form.Control as="textarea" rows={4} name="description" value={formData.description} onChange={handleInputChange} required />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Mức độ ưu tiên</Form.Label>
            <Form.Select name="priority" value={formData.priority} onChange={handleInputChange}>
              {PRIORITY_LEVELS.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* Image Upload Section */}
          <Form.Group className="mb-3">
            <Form.Label>
              Ảnh minh họa <Badge bg="secondary">{images.length}/10</Badge>
            </Form.Label>
            
            {/* Image Preview Grid */}
            {imagePreview.length > 0 && (
              <div className="mb-3">
                <div className="row g-2">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="col-md-3 col-sm-4 col-6">
                      <div className="position-relative">
                        <Image
                          src={preview.url}
                          alt={preview.name}
                          fluid
                          className="rounded"
                          style={{ height: '120px', objectFit: 'cover', width: '100%' }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          className="position-absolute top-0 end-0 m-1"
                          onClick={() => removeImage(index)}
                        >
                          <FaTimes />
                        </Button>
                        <div className="position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-75 text-white p-1">
                          <small>{preview.name}</small>
                          <br />
                          <small>{formatFileSize(preview.size)}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="d-grid">
              <Button
                variant="outline-primary"
                as="label"
                className="d-flex align-items-center justify-content-center gap-2"
                disabled={images.length >= 10}
              >
                <FaUpload />
                {images.length >= 10 ? 'Đã đạt giới hạn ảnh' : 'Chọn ảnh (tối đa 10 ảnh, 10MB/ảnh)'}
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={images.length >= 10}
                />
              </Button>
            </div>
            
            <Form.Text className="text-muted">
              Định dạng: JPG, PNG, GIF, WEBP. Kích thước tối đa: 10MB/ảnh
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Hủy</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? (
              <>
                <Spinner as="span" size="sm" className="me-2" />
                Đang gửi...
              </>
            ) : (
              'Gửi Yêu cầu'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default MaintenanceRequestDialog; 