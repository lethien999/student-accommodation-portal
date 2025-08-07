import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import { GoogleMap, Marker, useLoadScript, Autocomplete } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  marginTop: 16,
  borderRadius: 8,
  overflow: 'hidden'
};
const defaultCenter = { lat: 21.028511, lng: 105.804817 }; // Hà Nội

const LocationSearch = ({ onLocationSelect, initialValue = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [address, setAddress] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const autocompleteRef = useRef(null);

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY',
    libraries: ['places']
  });

  // Geocode latlng to address
  const geocodeLatLng = async (lat, lng) => {
    setLoading(true);
    setError(null);
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          setAddress(results[0].formatted_address);
          onLocationSelect({
            address: results[0].formatted_address,
            latitude: lat,
            longitude: lng
          });
        } else {
          setError('Không tìm thấy địa chỉ cho vị trí này.');
        }
        setLoading(false);
      });
    } catch (err) {
      setError('Lỗi khi lấy địa chỉ.');
      setLoading(false);
    }
  };

  // Khi click trên bản đồ
  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setSelectedPosition({ lat, lng });
    geocodeLatLng(lat, lng);
  };

  // Khi chọn từ autocomplete
  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setSelectedPosition({ lat, lng });
      setAddress(place.formatted_address);
      onLocationSelect({
        address: place.formatted_address,
        latitude: lat,
        longitude: lng
      });
    }
  };

  useEffect(() => {
    if (initialValue) {
      setAddress(initialValue);
      setSearchTerm(initialValue);
    }
  }, [initialValue]);

  if (loadError) {
    return <Typography color="error">Không thể tải Google Maps. Vui lòng kiểm tra API key.</Typography>;
  }
  if (!isLoaded) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Autocomplete
        onLoad={ref => (autocompleteRef.current = ref)}
        onPlaceChanged={handlePlaceChanged}
      >
        <TextField
          fullWidth
          label="Tìm kiếm địa điểm hoặc nhập địa chỉ"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          variant="outlined"
          placeholder="Nhập địa chỉ, quận, thành phố..."
          sx={{ mb: 2 }}
        />
      </Autocomplete>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedPosition || defaultCenter}
        zoom={selectedPosition ? 16 : 12}
        onClick={handleMapClick}
      >
        {selectedPosition && <Marker position={selectedPosition} />}
      </GoogleMap>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      {error && (
        <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>
      )}
      {address && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          <b>Địa chỉ đã chọn:</b> {address}
        </Typography>
      )}
    </Box>
  );
};

export default LocationSearch; 