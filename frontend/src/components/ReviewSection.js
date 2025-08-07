import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Form, Alert, Modal, Badge, Spinner, Row, Col } from 'react-bootstrap';
import { FaStar, FaEdit, FaTrash, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import reviewService from '../services/reviewService';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button as MuiButton,
  Alert as MuiAlert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, PhotoCamera as PhotoCameraIcon, Report as ReportIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ReportDialog from './ReportDialog';

const ReviewSection = ({ accommodationId, currentUser, onReviewUpdate }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    title: '',
    content: '',
    pros: '',
    cons: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportTargetId, setReportTargetId] = useState(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reviewService.getReviewsForAccommodation(accommodationId, {
        page: currentPage,
        limit: 10
      });
      setReviews(data.reviews || []);
      setTotalPages(data.totalPages || 1);
      setTotalReviews(data.total || 0);
    } catch (error) {
      setError('Lỗi khi tải đánh giá');
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [accommodationId, currentPage]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleFormChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const openReviewModal = (review = null) => {
    if (review) {
      setFormData({
        rating: review.rating,
        title: review.title,
        content: review.content,
        pros: review.pros || '',
        cons: review.cons || ''
      });
      setEditingReview(review);
    } else {
      setFormData({
        rating: 5,
        title: '',
        content: '',
        pros: '',
        cons: ''
      });
      setEditingReview(null);
    }
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      if (editingReview) {
        await reviewService.updateReview(editingReview.id, formData);
        setSuccess('Cập nhật đánh giá thành công!');
      } else {
        await reviewService.createReview({
          accommodationId,
          ...formData
        });
        setSuccess('Đánh giá đã được gửi thành công!');
      }

      setShowReviewModal(false);
      fetchReviews();
      if (onReviewUpdate) {
        onReviewUpdate();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Lỗi khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        await reviewService.deleteReview(reviewId);
        setSuccess('Xóa đánh giá thành công!');
        fetchReviews();
        if (onReviewUpdate) {
          onReviewUpdate();
        }
      } catch (error) {
        setError('Lỗi khi xóa đánh giá');
      }
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'text-warning' : 'text-muted'}
        style={{ cursor: 'pointer' }}
        onClick={() => handleFormChange('rating', index + 1)}
      />
    ));
  };

  const renderReviewStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'text-warning' : 'text-muted'}
      />
    ));
  };

  const canEditReview = (review) => {
    return currentUser && (
      currentUser.id === review.userId || 
      currentUser.role === 'admin' || 
      currentUser.role === 'moderator'
    );
  };

  const canDeleteReview = (review) => {
    return currentUser && (
      currentUser.id === review.userId || 
      currentUser.role === 'admin'
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <Card className="mt-4">
        <Card.Body className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="mt-4">
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      {/* Review Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-1">Đánh giá ({totalReviews})</h5>
          <div className="d-flex align-items-center">
            {renderReviewStars(4.2)} {/* Average rating */}
            <span className="ms-2 text-muted">4.2/5</span>
          </div>
        </div>
        {currentUser && (
          <Button variant="primary" onClick={() => openReviewModal()}>
            Viết đánh giá
          </Button>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div>
          {reviews.map((review) => (
            <Card key={review.id} className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-1">{review.title}</h6>
                    <div className="d-flex align-items-center mb-2">
                      {renderReviewStars(review.rating)}
                      <span className="ms-2 text-muted">
                        bởi {review.user?.username || 'Người dùng'}
                      </span>
                      <Badge bg="secondary" className="ms-2">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </Badge>
                    </div>
                  </div>
                  <div className="d-flex gap-1">
                    {canEditReview(review) && (
                      <Button size="sm" variant="outline-primary" onClick={() => openReviewModal(review)}>
                        <FaEdit />
                      </Button>
                    )}
                    {canDeleteReview(review) && (
                      <Button size="sm" variant="outline-danger" onClick={() => handleDeleteReview(review.id)}>
                        <FaTrash />
                      </Button>
                    )}
                    <IconButton size="small" onClick={() => {
                        setReportTargetId(review.id);
                        setReportDialogOpen(true);
                    }}>
                        <ReportIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>
                <p><strong>{review.user?.username}</strong></p>
                <p>{review.content || review.comment}</p>
              </Card.Body>
            </Card>
          ))}

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
        </div>
      ) : (
        <Card>
          <Card.Body className="text-center text-muted">
            <p>Chưa có đánh giá nào cho nhà trọ này.</p>
            {currentUser && (
              <Button variant="primary" onClick={() => openReviewModal()}>
                Viết đánh giá đầu tiên
              </Button>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Review Form Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá mới'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Đánh giá sao *</Form.Label>
              <div className="d-flex align-items-center">
                {renderStars(formData.rating)}
                <span className="ms-2">{formData.rating}/5</span>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề *</Form.Label>
              <Form.Control
                type="text"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="Tiêu đề đánh giá"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nội dung đánh giá *</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={formData.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn về nhà trọ này"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ưu điểm</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.pros}
                    onChange={(e) => handleFormChange('pros', e.target.value)}
                    placeholder="Những điểm tốt của nhà trọ"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Nhược điểm</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={formData.cons}
                    onChange={(e) => handleFormChange('cons', e.target.value)}
                    placeholder="Những điểm cần cải thiện"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmitReview} disabled={submitting}>
            {submitting ? 'Đang gửi...' : (editingReview ? 'Cập nhật' : 'Gửi đánh giá')}
          </Button>
        </Modal.Footer>
      </Modal>

      <ReportDialog
        show={reportDialogOpen}
        onHide={() => setReportDialogOpen(false)}
        targetType="review"
        targetId={reportTargetId}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ReviewSection; 