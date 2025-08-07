import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, Modal, Image, Form, ListGroup, InputGroup } from 'react-bootstrap';
import accommodationService from '../services/accommodationService';
import reviewService from '../services/reviewService';
import { useAuth } from '../contexts/AuthContext';
import { FaMapMarkerAlt, FaInfoCircle, FaCheckCircle, FaEdit, FaTrash, FaPaperPlane, FaStar, FaWrench } from 'react-icons/fa';
import ReportDialog from '../components/ReportDialog';
import PaymentDialog from '../components/PaymentDialog';
import StarRating from '../components/StarRating';
import Chip from '@mui/material/Chip';
import { useCurrency } from '../contexts/CurrencyContext';
import LandlordReputationBadge from '../components/LandlordReputationBadge';

const AccommodationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Review state
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(0);
  const [editingReview, setEditingReview] = useState(null); // { id, comment, rating }
  const [reviewError, setReviewError] = useState('');
  
  // State for image modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { formatCurrency } = useCurrency();

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowImageModal(true);
  };

  const fetchAccommodationData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await accommodationService.getAccommodationDetails(id);
      setAccommodation(data);
      setReviews(data.reviews || []);
      setError('');
    } catch (err) {
      setError('Không thể tải thông tin phòng. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAccommodationData();
  }, [fetchAccommodationData]);
    
  const handleReviewSubmit = async (e) => {
      e.preventDefault();
      if (newReviewRating === 0 || newReviewText.trim() === '') {
          setReviewError('Vui lòng cho điểm và viết bình luận.');
          return;
      }

      try {
          const reviewData = {
              accommodationId: id,
              rating: newReviewRating,
              comment: newReviewText
          };
          
          if(editingReview) {
              await reviewService.updateReview(editingReview.id, reviewData);
              setEditingReview(null);
          } else {
              await reviewService.createReview(reviewData);
          }
          
          setNewReviewText('');
          setNewReviewRating(0);
          setReviewError('');
          // Refresh reviews
          fetchAccommodationData(); 
      } catch (error) {
          setReviewError(error.message || 'Gửi đánh giá thất bại.');
      }
  };

  const handleEditClick = (review) => {
      setEditingReview(review);
      setNewReviewText(review.comment);
      setNewReviewRating(review.rating);
      // Focus the form
      document.getElementById('review-form-container')?.scrollIntoView({ behavior: 'smooth' });
  };
    
  const handleDeleteClick = async (reviewId) => {
      if(window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
          try {
            await reviewService.deleteReview(reviewId);
            // Refresh reviews
            fetchAccommodationData();
          } catch(error) {
            setReviewError(error.message || 'Xóa đánh giá thất bại.');
          }
      }
  };
    
  const userHasReviewed = reviews.some(review => review.reviewUser.id === user?.id);

  const handleDelete = async () => {
    try {
        await accommodationService.deleteAccommodation(id);
        setShowDeleteConfirm(false);
        navigate('/accommodations');
    } catch (error) {
        console.error("Failed to delete accommodation", error);
        alert('Xóa phòng thất bại. Vui lòng thử lại.');
        setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Đang tải dữ liệu...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!accommodation) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Không tìm thấy thông tin phòng.</Alert>
      </Container>
    );
  }

  const {
    title,
    description,
    address,
    city,
    price,
    status,
    accommodationOwner,
    images,
    amenities,
    roomType
  } = accommodation;

  const isOwnerOrAdmin = isAuthenticated && (user?.id === accommodationOwner?.id || user?.role === 'admin');

  const roomTypes = Array.isArray(roomType)
    ? roomType
    : roomType
      ? [roomType]
      : [];

  return (
    <Container className="mt-4">
      {isOwnerOrAdmin && (
        <Card className="mb-3 bg-light border-0">
            <Card.Body className="d-flex justify-content-end align-items-center">
                 <h5 className="me-auto mb-0"><FaWrench className="me-2"/>Công cụ quản lý</h5>
                <Button variant="outline-primary" className="me-2" onClick={() => navigate(`/accommodations/edit/${id}`)}>
                    <FaEdit className="me-1" /> Sửa thông tin
                </Button>
                <Button variant="outline-danger" onClick={() => setShowDeleteConfirm(true)}>
                    <FaTrash className="me-1" /> Xóa phòng
                </Button>
            </Card.Body>
        </Card>
      )}

      <Card className="p-4 rounded-3 shadow-sm">
        <Row>
          <Col md={12}>
            <h1 className="mb-2">{title}</h1>
            <div className="d-flex align-items-center mb-3 flex-wrap">
              <FaMapMarkerAlt className="me-2 text-muted" />
              <span className="me-3">{address}, {city}</span>
              <Badge bg={status === 'available' ? 'success' : 'danger'} className="me-3">{status === 'available' ? 'Còn phòng' : 'Hết phòng'}</Badge>
              {roomTypes.map((type) => (
                <Chip key={type} label={type} className="me-1 mb-1" />
              ))}
            </div>
          </Col>
        </Row>
        
        <Row className="mb-4">
            <Col md={8} className="mb-3 mb-md-0">
                <Image 
                    src={images && images.length > 0 ? images[0] : 'https://via.placeholder.com/800x500.png?text=No+Image'} 
                    alt={title} 
                    fluid 
                    rounded 
                    className="main-image"
                    onClick={() => handleImageClick(images && images.length > 0 ? images[0] : '')}
                    style={{ cursor: 'pointer', maxHeight: '500px', width: '100%', objectFit: 'cover' }}
                />
            </Col>
            <Col md={4}>
                <Row>
                    {images && images.slice(1, 5).map((img, index) => (
                        <Col key={index} xs={6} className="mb-2">
                            <Image 
                                src={img} 
                                alt={`${title} - view ${index + 2}`} 
                                fluid 
                                rounded 
                                className="thumbnail-image"
                                onClick={() => handleImageClick(img)}
                                style={{ cursor: 'pointer', height: '115px', width: '100%', objectFit: 'cover' }}
                            />
                        </Col>
                    ))}
                </Row>
            </Col>
        </Row>

        <Row>
          {/* Main Info */}
          <Col lg={8}>
            <div className="accommodation-content">
              <h3><FaInfoCircle className="me-2" />Thông tin chi tiết</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{description}</p>
              
              <div className="amenities-section mt-4">
                <h4><FaStar className="me-2" />Tiện ích nổi bật</h4>
                <Row>
                    {amenities && amenities.length > 0 ? (
                        amenities.map((amenity, index) => (
                            <Col key={index} md={6} lg={4}>
                                <div className="d-flex align-items-center mb-2">
                                    <FaCheckCircle className="text-success me-2" />
                                    <span>{amenity}</span>
                                </div>
                            </Col>
                        ))
                    ) : (
                        <p>Chủ nhà chưa cập nhật tiện ích cho phòng này.</p>
                    )}
                </Row>
              </div>

              <div className="reviews-section mt-4" id="reviews">
                <h4>Đánh giá từ người thuê ({reviews.length || 0})</h4>
                <ListGroup variant="flush">
                    {reviews.length > 0 ? reviews.map(review => (
                        <ListGroup.Item key={review.id} className="px-0">
                            <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1">{review.reviewUser.username}</h6>
                                <small>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</small>
                            </div>
                            <StarRating rating={review.rating} isEditable={false} />
                            <p className="mb-1">{review.comment}</p>
                             {isAuthenticated && user?.id === review.reviewUser.id && (
                                <div>
                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditClick(review)}><FaEdit/> Sửa</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(review.id)}><FaTrash/> Xóa</Button>
                                </div>
                            )}
                        </ListGroup.Item>
                    )) : <p>Chưa có đánh giá nào cho phòng này.</p>}
                </ListGroup>

                {isAuthenticated && !userHasReviewed && !editingReview && (
                    <div className="add-review-form mt-4" id="review-form-container">
                        <h5>Viết đánh giá của bạn</h5>
                        <Form onSubmit={handleReviewSubmit}>
                             {reviewError && <Alert variant="danger">{reviewError}</Alert>}
                             <Form.Group className="mb-2">
                                <Form.Label>Cho điểm</Form.Label>
                                <StarRating rating={newReviewRating} setRating={setNewReviewRating} />
                            </Form.Group>
                            <Form.Group>
                                <InputGroup>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Chia sẻ cảm nhận của bạn về nơi ở này..."
                                        value={newReviewText}
                                        onChange={(e) => setNewReviewText(e.target.value)}
                                        required
                                    />
                                    <Button type="submit" variant="primary"><FaPaperPlane /></Button>
                                </InputGroup>
                            </Form.Group>
                        </Form>
                    </div>
                )}
                  {editingReview && (
                     <div className="add-review-form mt-4" id="review-form-container">
                        <h5>Chỉnh sửa đánh giá</h5>
                         <Form onSubmit={handleReviewSubmit}>
                             {reviewError && <Alert variant="danger">{reviewError}</Alert>}
                             <Form.Group className="mb-2">
                                <Form.Label>Cho điểm</Form.Label>
                                <StarRating rating={newReviewRating} setRating={setNewReviewRating} />
                            </Form.Group>
                            <Form.Group>
                                <InputGroup>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={newReviewText}
                                        onChange={(e) => setNewReviewText(e.target.value)}
                                        required
                                    />
                                     <Button type="submit" variant="success">Lưu thay đổi</Button>
                                </InputGroup>
                            </Form.Group>
                             <Button variant="secondary" size="sm" className="mt-2" onClick={() => { setEditingReview(null); setNewReviewText(''); setNewReviewRating(0); }}>Hủy</Button>
                        </Form>
                    </div>
                  )}
              </div>
            </div>
          </Col>

          {/* Sidebar with Actions */}
          <Col lg={4}>
            <Card className="p-3 shadow-sm sticky-top">
              <Card.Body>
                <h3 className="text-success mb-3">{formatCurrency(price)} / tháng</h3>
                
                <div className="landlord-info mb-3">
                  <div className="d-flex align-items-center">
                    <Image src={accommodationOwner?.avatar || 'https://via.placeholder.com/50'} roundedCircle width={50} height={50} className="me-3" />
                    <div>
                      <Card.Subtitle className="text-muted">Chủ nhà</Card.Subtitle>
                      <Card.Title as="h5" className="mb-0">
                        {accommodationOwner?.username}
                        {accommodationOwner && <LandlordReputationBadge landlordId={accommodationOwner.id} />}
                      </Card.Title>
                    </div>
                  </div>
                </div>

                <div className="d-grid gap-2">
                  <Button variant="primary" size="lg" onClick={() => navigate(`/chat/${accommodationOwner?.id}`)}>
                    Nhắn tin
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Report Modal */}
      <ReportDialog
        show={showReportModal}
        onHide={() => setShowReportModal(false)}
        targetId={id}
        targetType="accommodation"
        currentUser={user}
      />

      {/* Payment Modal */}
      <PaymentDialog
        show={showPaymentModal}
        onHide={() => setShowPaymentModal(false)}
        accommodation={{ id, name: title, price, depositAmount: price / 2 }} // Assuming deposit is 50%
        type="deposit"
      />

      {/* Image Modal */}
      <Modal show={showImageModal} onHide={() => setShowImageModal(false)} size="lg" centered>
        <Modal.Body className="p-0">
          <Image src={selectedImage} alt="Full size view" fluid />
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn xóa phòng này không? Hành động này không thể hoàn tác.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Xóa vĩnh viễn
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AccommodationDetailPage; 