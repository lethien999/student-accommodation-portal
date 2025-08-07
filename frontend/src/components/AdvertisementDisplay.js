import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import advertisementService from '../services/advertisementService';

const AdvertisementDisplay = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        setLoading(true);
        const activeAds = await advertisementService.getActiveAdvertisements();
        setAdvertisements(activeAds);

        // Record impressions for all fetched ads
        activeAds.forEach(ad => {
          advertisementService.recordImpression(ad.id);
        });
      } catch (err) {
        setError(err.message || 'Failed to load advertisements');
      } finally {
        setLoading(false);
      }
    };

    fetchAdvertisements();
  }, []);

  const handleClick = (adId, targetUrl) => {
    advertisementService.recordClick(adId);
    window.open(targetUrl, '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ my: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (advertisements.length === 0) {
    return null; // Don't render if no active ads
  }

  return (
    <Box sx={{ my: 4, textAlign: 'center' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Quảng cáo nổi bật
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 3,
          mt: 3,
        }}
      >
        {advertisements.map((ad) => (
          <Card
            key={ad.id}
            sx={{
              width: 300,
              cursor: 'pointer',
              '&:hover': { transform: 'scale(1.02)' },
              transition: 'transform 0.2s ease-in-out',
            }}
            onClick={() => handleClick(ad.id, ad.targetUrl)}
          >
            {ad.imageUrl && (
              <CardMedia
                component="img"
                height="140"
                image={ad.imageUrl}
                alt={ad.title}
                sx={{ objectFit: 'cover' }}
              />
            )}
            <CardContent>
              <Typography gutterBottom variant="h6" component="div">
                {ad.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ad.description}
              </Typography>
              <Button size="small" sx={{ mt: 2 }}>
                Xem thêm
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default AdvertisementDisplay;
