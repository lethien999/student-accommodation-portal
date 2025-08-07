import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapView = ({ accommodations, highlightedId }) => {
  const defaultPosition = [10.7769, 106.7009]; // Default to center of HCMC

  // Filter out accommodations without valid coordinates
  const validAccommodations = accommodations.filter(acc => acc.latitude && acc.longitude);

  return (
    <MapContainer 
      center={defaultPosition} 
      zoom={13} 
      style={{ height: '100%', width: '100%' }}
      className="map-view-container"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {validAccommodations.map(acc => (
        <Marker 
          key={acc.id} 
          position={[acc.latitude, acc.longitude]}
        >
          <Popup>
            <div>
              <h5>{acc.title}</h5>
              <p>{acc.address}</p>
              <p>Giá: {acc.price.toLocaleString()} VNĐ/tháng</p>
              <a href={`/accommodations/${acc.id}`} target="_blank" rel="noopener noreferrer">
                Xem chi tiết
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView; 