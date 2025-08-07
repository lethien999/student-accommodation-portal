import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const Map = ({ accommodations, center, zoom = 13, height = 400 }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [center.lat, center.lon],
        zoom
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add markers for each accommodation
    accommodations?.forEach((accommodation) => {
      if (accommodation.latitude && accommodation.longitude) {
        const marker = L.marker([accommodation.latitude, accommodation.longitude])
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div>
              <h3>${accommodation.title}</h3>
              <p>${accommodation.address}</p>
              <p>${accommodation.price.toLocaleString('vi-VN')}đ/tháng</p>
            </div>
          `);
        markersRef.current.push(marker);
      }
    });

    // Fit bounds if there are accommodations
    if (accommodations?.length > 0) {
      const bounds = L.latLngBounds(
        accommodations
          .filter((a) => a.latitude && a.longitude)
          .map((a) => [a.latitude, a.longitude])
      );
      mapInstanceRef.current.fitBounds(bounds);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [accommodations, center, zoom]);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Vị trí
      </Typography>
      <Box
        ref={mapRef}
        sx={{
          height,
          width: '100%',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      />
    </Paper>
  );
};

export default Map; 