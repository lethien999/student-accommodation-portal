import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { Report as ReportIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import accommodationService from '../services/accommodationService';
import ReviewSection from './ReviewSection';
import ReportDialog from './ReportDialog';
import { useAuth } from '../contexts/AuthContext';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../contexts/CurrencyContext';

const AccommodationDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const { formatCurrency } = useCurrency();

  useEffect(() => {
    fetchAccommodation();
  }, [id]);

  const fetchAccommodation = async () => {
    try {
      const data = await accommodationService.getAccommodationById(id);
      setAccommodation(data);
      if (user) {
        const favoriteStatus = await accommodationService.checkFavoriteStatus(id);
        setIsFavorite(favoriteStatus);
      }
    } catch (err) {
      setError('Failed to load accommodation details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await accommodationService.removeFromFavorites(id);
      } else {
        await accommodationService.addToFavorites(id);
      }
      setIsFavorite(!isFavorite);
    } catch (err) {
      setError('Failed to update favorite status');
    }
  };

  const shareUrl = window.location.href;
  const shareText = (accommodation?.title || 'Nhà trọ') + ' - ' + (accommodation?.address || '');

  const handleShare = (platform) => {
    const url = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(shareText);
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    } else if (platform === 'zalo') {
      window.open(`https://zalo.me/share?url=${url}&text=${text}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(shareUrl);
      alert('Đã copy link vào clipboard!');
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!accommodation) {
    return <Typography>Accommodation not found</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            {accommodation.title}
          </Typography>
          <Box>
            <IconButton onClick={() => handleShare('facebook')} title={t('Share Facebook')}><ShareIcon color="primary" /></IconButton>
            <IconButton onClick={() => handleShare('twitter')} title={t('Share Twitter')}><img src="https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twitter.svg" alt="Twitter" style={{width: 22, height: 22}} /></IconButton>
            <IconButton onClick={() => handleShare('zalo')} title={t('Share Zalo')}><img src="https://stc-zaloprofile.zadn.vn/pc/v1/images/zalo_sharelogo.png" alt="Zalo" style={{width: 22, height: 22}} /></IconButton>
            <IconButton onClick={() => handleShare('copy')} title={t('Copy link')}><ContentCopyIcon /></IconButton>
            {user && (
              <>
                <IconButton onClick={handleToggleFavorite} color="primary">
                  {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <IconButton onClick={() => setOpenReportDialog(true)} color="error">
                  <ReportIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              <img
                src={accommodation.images[0]}
                alt={accommodation.title}
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
              />
            </Box>
            <Typography variant="h6" gutterBottom>
              {t('Description')}
            </Typography>
            <Typography paragraph>{accommodation.description}</Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {t('Detail Information')}
              </Typography>
              <Typography>
                <strong>{t('Price')}:</strong> {formatCurrency(accommodation.price)}
              </Typography>
              <Typography>
                <strong>{t('Address')}:</strong> {accommodation.address}
              </Typography>
              <Typography>
                <strong>{t('Area')}:</strong> {accommodation.area}m²
              </Typography>
              <Typography>
                <strong>{t('Owner')}:</strong> {accommodation.accommodationOwner?.username}
              </Typography>
              {accommodation.accommodationOwner?.isVerifiedLandlord && (
                <Typography color="primary">
                  ✓ {t('Verified Landlord')}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <ReviewSection accommodationId={id} />

      <ReportDialog
        open={openReportDialog}
        onClose={() => setOpenReportDialog(false)}
        reportType="accommodation"
        reportId={id}
      />
    </Container>
  );
};

export default AccommodationDetail; 