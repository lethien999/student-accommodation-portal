import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
  Alert,
  CircularProgress
} from '@mui/material';
import { PhotoCamera, CloudUpload, Close } from '@mui/icons-material';
import accommodationService from '../services/accommodationService';
import LocationSearch from '../components/LocationSearch';
import { useTranslation } from 'react-i18next';

const AMENITIES = [
  'Wi-Fi',
  'Điều hòa',
  'Nóng lạnh',
  'Tủ lạnh',
  'Giường',
  'Tủ quần áo',
  'Bàn học',
  'Tủ bếp',
  'Máy giặt',
  'Ban công',
  'Camera an ninh',
  'Bảo vệ 24/7'
];

const ROOM_TYPES = [
  'Phòng đơn',
  'Phòng đôi',
  'Ký túc xá',
  'Chung cư mini',
  'Nhà nguyên căn',
  'Gác lửng'
];

const AccommodationForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    roomType: [],
    address: '',
    city: '',
    state: '',
    zipCode: '',
    amenities: [],
    location: null
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchAccommodation = async () => {
        setLoading(true);
        try {
          const data = await accommodationService.getAccommodationDetails(id);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            price: data.price || '',
            roomType: Array.isArray(data.roomType) ? data.roomType : (data.roomType ? [data.roomType] : []),
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zipCode || '',
            amenities: data.amenities || [],
            location: { lat: data.latitude, lon: data.longitude, name: data.address }
          });
          setExistingImages(data.images || []);
        } catch (err) {
          setError('Không thể tải dữ liệu phòng. Vui lòng thử lại.');
        } finally {
          setLoading(false);
        }
      };
      fetchAccommodation();
    }
  }, [id, isEditMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoomTypeChange = (event) => {
    const {
      target: { value },
    } = event;
    setFormData((prev) => ({
      ...prev,
      roomType: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleLocationSelect = (location) => {
    const { address: nominatimAddress } = location; // address is a sub-object from Nominatim
    
    const city = nominatimAddress.city || nominatimAddress.state || ''; // e.g., Thành phố Hồ Chí Minh

    setFormData((prev) => ({
      ...prev,
      location: {
        name: location.display_name,
        lat: parseFloat(location.lat),
        lon: parseFloat(location.lon)
      },
      city: city,
      state: nominatimAddress.state || '',
      zipCode: nominatimAddress.postcode || ''
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      setError('Chỉ được tải lên tối đa 5 ảnh');
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'amenities' || key === 'roomType') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'location' && formData.location) {
          formDataToSend.append('latitude', formData.location.lat);
          formDataToSend.append('longitude', formData.location.lon);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      images.forEach((image) => {
        formDataToSend.append('images', image);
      });
      
      if (isEditMode) {
        formDataToSend.append('existingImages', JSON.stringify(existingImages));
        await accommodationService.updateAccommodation(id, formDataToSend);
        navigate(`/accommodations/${id}`);
      } else {
        await accommodationService.createAccommodation(formDataToSend);
        navigate('/dashboard/landlord');
      }
    } catch (err) {
      console.error("Update failed:", err.response);
      let errorMessage = `Có lỗi xảy ra khi ${isEditMode ? 'cập nhật' : 'đăng'} nhà trọ.`;
      if (err.response && err.response.data) {
        if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        if (err.response.data.errors && Array.isArray(err.response.data.errors) && err.response.data.errors.length > 0) {
          const validationErrors = err.response.data.errors.map(e => e.message).join('. ');
          errorMessage = `Lỗi dữ liệu: ${validationErrors}`;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? t('Edit Accommodation') : t('Add New Accommodation')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label={t('Title')}
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label={t('Description')}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                type="number"
                label={t('Price (VND/month)')}
                name="price"
                value={formData.price}
                onChange={handleInputChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('Room Type')}</InputLabel>
                <Select
                  name="roomType"
                  multiple
                  value={formData.roomType}
                  onChange={handleRoomTypeChange}
                  label={t('Room Type')}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {ROOM_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <LocationSearch 
                onLocationSelect={handleLocationSelect} 
                initialValue={formData.address}
              />
              <FormHelperText sx={{mt: 1}}>
                {t('Search for a general location, then edit the detailed address below.')}
              </FormHelperText>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label={t('Detailed Address')}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder={t('Please enter house number, street name, ward/commune...')}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t('Amenities')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {AMENITIES.map((amenity) => (
                  <Chip
                    key={amenity}
                    label={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    color={formData.amenities.includes(amenity) ? 'primary' : 'default'}
                    variant={formData.amenities.includes(amenity) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {t('Images (max 5)')}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb:2 }}>
                {existingImages.map((image, index) => (
                  <Box key={index} sx={{ position: 'relative', width: 150, height: 150 }}>
                    <img src={image} alt={`Existing ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {images.map((image, index) => (
                  <Box
                    key={index}
                    sx={{
                      position: 'relative',
                      width: 150,
                      height: 150
                    }}
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 4
                      }}
                    />
                    <Button
                      size="small"
                      color="error"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        minWidth: 'auto',
                        p: 0.5
                      }}
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Close fontSize="small" />
                    </Button>
                  </Box>
                ))}
              </Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ mt: 2 }}
              >
                {t('Upload Images')}
                <input type="file" hidden multiple onChange={handleImageChange} />
              </Button>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/accommodations')}
                >
                  {t('Cancel')}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <CloudUpload />}
                >
                  {isEditMode ? t('Update') : t('Submit')}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AccommodationForm; 