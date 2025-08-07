import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import reviewService from '../services/reviewService';

const ModeratorReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showActionDialog, setShowActionDialog] = useState(false);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await reviewService.getPendingReviews();
      setReviews(data);
    } catch (err) {
      setError('Lỗi khi tải danh sách đánh giá chờ duyệt');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (review) => {
    setSelectedReview(review);
    setActionType('approve');
    setReason('');
    setShowActionDialog(true);
  };

  const handleReject = (review) => {
    setSelectedReview(review);
    setActionType('reject');
    setReason('');
    setShowActionDialog(true);
  };

  const handleProcessReview = async () => {
    if (!selectedReview) return;
    
    try {
      setProcessing(true);
      await reviewService.processReview(selectedReview.id, actionType, reason);
      setShowActionDialog(false);
      setSelectedReview(null);
      setActionType('');
      setReason('');
      fetchReviews(); // Refresh list
    } catch (err) {
      setError(`Lỗi khi ${actionType === 'approve' ? 'duyệt' : 'từ chối'} đánh giá`);
      console.error('Error processing review:', err);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Đã từ chối';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Duyệt Đánh Giá
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {reviews.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Không có đánh giá nào chờ duyệt
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Chỗ ở</TableCell>
                <TableCell>Người đánh giá</TableCell>
                <TableCell>Điểm</TableCell>
                <TableCell>Nội dung</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>{review.id}</TableCell>
                  <TableCell>{review.accommodation?.title || 'N/A'}</TableCell>
                  <TableCell>{review.user?.username || 'N/A'}</TableCell>
                  <TableCell>
                    <Rating value={review.rating} readOnly size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {review.comment}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusText(review.status)} 
                      color={getStatusColor(review.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => handleApprove(review)}
                      >
                        Duyệt
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<CancelIcon />}
                        onClick={() => handleReject(review)}
                      >
                        Từ chối
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                      >
                        Xem
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onClose={() => setShowActionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {actionType === 'approve' ? 'Duyệt Đánh Giá' : 'Từ Chối Đánh Giá'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {actionType === 'approve' 
              ? 'Bạn có chắc chắn muốn duyệt đánh giá này?' 
              : 'Bạn có chắc chắn muốn từ chối đánh giá này?'
            }
          </Typography>
          <TextField
            fullWidth
            label="Lý do (tùy chọn)"
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={actionType === 'approve' 
              ? 'Lý do duyệt...' 
              : 'Lý do từ chối...'
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowActionDialog(false)} disabled={processing}>
            Hủy
          </Button>
          <Button 
            onClick={handleProcessReview} 
            variant="contained"
            color={actionType === 'approve' ? 'success' : 'error'}
            disabled={processing}
          >
            {processing ? <CircularProgress size={20} /> : 
              actionType === 'approve' ? 'Duyệt' : 'Từ chối'
            }
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ModeratorReviewsPage; 