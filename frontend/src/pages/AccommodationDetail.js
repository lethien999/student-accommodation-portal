import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Divider,
  Rating,
  CircularProgress,
  ImageList,
  ImageListItem,
  Dialog,
  DialogContent
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  LocationOn,
  AttachMoney,
  Phone,
  Email,
  Share,
  Close,
  Payment
} from '@mui/icons-material';
import accommodationService from '../services/accommodationService';
import favoriteService from '../services/favoriteService';
import { useAuth } from '../contexts/AuthContext';
import ReviewSection from '../components/ReviewSection';
import PaymentDialog from '../components/PaymentDialog';
import { Helmet } from 'react-helmet-async';
import ReportDialog from '../components/ReportDialog';

const AccommodationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentType, setPaymentType] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        const data = await accommodationService.getAccommodationDetails(id);
        setAccommodation(data);
        setIsFavorite(data.isFavorite);
      } catch (err) {
        setError('Không thể tải thông tin nhà trọ. Vui lòng thử lại.');
        console.error('Error fetching accommodation:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodation();
  }, [id]);

  const handleFavoriteToggle = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        await favoriteService.removeFromFavorites(id);
      } else {
        await favoriteService.addToFavorites(id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handlePaymentClick = (type) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setPaymentType(type);
    setPaymentDialogOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!accommodation) {
    return null;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {accommodation && (
        <Helmet>
          <title>{`${accommodation.title} - ${accommodation.address} - Student Accommodation Portal`}</title>
          <meta
            name="description"
            content={`${accommodation.description.substring(0, 150)}... Giá: ${accommodation.price.toLocaleString('vi-VN')}đ/tháng. Địa chỉ: ${accommodation.address}.`}
          />
          <meta property="og:title" content={`${accommodation.title} - ${accommodation.address} - Student Accommodation Portal`} />
          <meta
            property="og:description"
            content={`${accommodation.description.substring(0, 150)}... Giá: ${accommodation.price.toLocaleString('vi-VN')}đ/tháng. Địa chỉ: ${accommodation.address}.`}
          />
          <meta property="og:type" content="article" />
          <meta property="og:url" content={`https://yourwebsite.com/accommodations/${accommodation.id}`} />
          {accommodation.images && accommodation.images.length > 0 && (
            <meta property="og:image" content={accommodation.images[0]} />
          )}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${accommodation.title} - ${accommodation.address} - Student Accommodation Portal`} />
          <meta
            name="twitter:description"
            content={`${accommodation.description.substring(0, 150)}... Giá: ${accommodation.price.toLocaleString('vi-VN')}đ/tháng. Địa chỉ: ${accommodation.address}.`}
          />
          {accommodation.images && accommodation.images.length > 0 && (
            <meta name="twitter:image" content={accommodation.images[0]} />
          )}
        </Helmet>
      )}
      <Grid container spacing={4}>
        {/* Hình ảnh */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <ImageList cols={4} rowHeight={200} gap={8}>
              {accommodation.images?.map((image, index) => (
                <ImageListItem
                  key={index}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={image}
                    alt={`${accommodation.title} - ${index + 1}`}
                    loading="lazy"
                    style={{ objectFit: 'cover', height: '100%' }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Paper>
        </Grid>

        {/* Thông tin chính */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h4" component="h1">
                {accommodation.title}
              </Typography>
              <Box>
                <IconButton onClick={handleFavoriteToggle} color="primary">
                  {isFavorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <Button variant="outlined" color="error" sx={{ ml: 2 }} onClick={() => setReportDialogOpen(true)}>
                  Báo cáo
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LocationOn color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">{accommodation.address}</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AttachMoney color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5" color="primary">
                {accommodation.price.toLocaleString('vi-VN')}đ/tháng
              </Typography>
            </Box>

            {accommodation.rating && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating value={accommodation.rating} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({accommodation.reviewCount} đánh giá)
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Mô tả
            </Typography>
            <Typography variant="body1" paragraph>
              {accommodation.description}
            </Typography>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Tiện nghi
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {accommodation.amenities?.map((amenity) => (
                <Chip key={amenity} label={amenity} />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Thông tin liên hệ */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Thông tin liên hệ
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Phone color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">{accommodation.accommodationOwner.phone}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Email color="action" sx={{ mr: 1 }} />
              <Typography variant="body1">{accommodation.accommodationOwner.email}</Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              startIcon={<Phone />}
            >
              Gọi ngay
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 1 }}
              startIcon={<Email />}
            >
              Gửi tin nhắn
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 1 }}
              startIcon={<Share />}
            >
              Chia sẻ
            </Button>

            {accommodation.depositAmount > 0 && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                startIcon={<Payment />}
                onClick={() => handlePaymentClick('deposit')}
              >
                Đặt cọc ({accommodation.depositAmount.toLocaleString('vi-VN')}đ)
              </Button>
            )}

            <Button
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ mt: 1 }}
              startIcon={<Payment />}
              onClick={() => handlePaymentClick('rent')}
            >
              Thanh toán tiền trọ ({accommodation.price.toLocaleString('vi-VN')}đ)
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Review Section */}
      <ReviewSection accommodationId={accommodation.id} />

      {/* Dialog xem ảnh */}
      <Dialog
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={() => setSelectedImage(null)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)'
              }
            }}
          >
            <Close />
          </IconButton>
          <img
            src={selectedImage}
            alt="Selected accommodation"
            style={{ width: '100%', height: 'auto' }}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        accommodation={accommodation}
        type={paymentType}
      />

      <ReportDialog
        show={reportDialogOpen}
        onHide={() => setReportDialogOpen(false)}
        targetType="accommodation"
        targetId={accommodation.id}
        currentUser={user}
      />
    </Container>
  );
};

export default AccommodationDetail;