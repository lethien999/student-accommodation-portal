import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { FaStar, FaDirections, FaFilter, FaSearch } from 'react-icons/fa';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon for favorites
const favoriteIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component for handling map events
const MapEvents = ({ onMapClick }) => {
  const map = useMap();

  useEffect(() => {
    map.on('click', (e) => {
      onMapClick(e.latlng);
    });
  }, [map, onMapClick]);

  return null;
};

// Custom Search Component
const SearchBox = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const map = useMap();

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        map.flyTo([parseFloat(lat), parseFloat(lon)], 15);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      right: '10px',
      zIndex: 1000,
      display: 'flex',
      gap: '5px'
    }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Tìm địa điểm..."
        style={{
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          width: '200px'
        }}
      />
      <button
        onClick={handleSearch}
        style={{
          padding: '8px 12px',
          borderRadius: '4px',
          border: 'none',
          background: '#4f46e5',
          color: 'white',
          cursor: 'pointer'
        }}
      >
        <FaSearch />
      </button>
    </div>
  );
};

const Map = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const mapRef = useRef(null);

  // Default center position (Hanoi)
  const defaultPosition = [21.0285, 105.8542];

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/accommodations');
        const data = response.data.accommodations || [];
        setAccommodations(data);
        setFilteredAccommodations(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch accommodations');
        setLoading(false);
      }
    };

    fetchAccommodations();
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage when changed
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleMapClick = (latlng) => {
    if (selectedAccommodation) {
      // Calculate route
      const url = `https://www.google.com/maps/dir/?api=1&destination=${latlng.lat},${latlng.lng}`;
      window.open(url, '_blank');
    }
  };

  const toggleFavorite = (accommodationId) => {
    setFavorites(prev => {
      if (prev.includes(accommodationId)) {
        return prev.filter(id => id !== accommodationId);
      } else {
        return [...prev, accommodationId];
      }
    });
  };

  const handlePriceFilter = (min, max) => {
    setPriceRange({ min, max });
    const filtered = accommodations.filter(acc =>
      acc.price >= min && acc.price <= max
    );
    setFilteredAccommodations(filtered);
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Đang tải...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

  return (
    <div style={{ height: 'calc(100vh - 120px)', width: '100%', position: 'relative' }}>
      {/* Filter Controls */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            background: '#4f46e5',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaFilter /> Lọc
        </button>

        {showFilters && (
          <div style={{ marginTop: '10px', minWidth: '200px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>Khoảng giá</h4>
            <input
              type="range"
              min="0"
              max="10000000"
              step="500000"
              value={priceRange.max}
              onChange={(e) => handlePriceFilter(priceRange.min, parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ fontSize: '14px', color: '#666' }}>
              Tối đa: {new Intl.NumberFormat('vi-VN').format(priceRange.max)} VND
            </div>
          </div>
        )}
      </div>

      <MapContainer
        center={defaultPosition}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <SearchBox />
        <MapEvents onMapClick={handleMapClick} />

        {filteredAccommodations.map((accommodation) => (
          <Marker
            key={accommodation.id}
            position={[
              accommodation.latitude || defaultPosition[0],
              accommodation.longitude || defaultPosition[1]
            ]}
            icon={favorites.includes(accommodation.id) ? favoriteIcon : new L.Icon.Default()}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px 0' }}>{accommodation.name}</h3>
                <p style={{ margin: '4px 0' }}><strong>Địa chỉ:</strong> {accommodation.address}</p>
                <p style={{ margin: '4px 0', color: '#4f46e5', fontWeight: 'bold' }}>
                  {new Intl.NumberFormat('vi-VN').format(accommodation.price)} VND/tháng
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={() => toggleFavorite(accommodation.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: favorites.includes(accommodation.id) ? 'gold' : 'gray',
                      fontSize: '18px'
                    }}
                  >
                    <FaStar />
                  </button>
                  <button
                    onClick={() => setSelectedAccommodation(accommodation)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#4f46e5',
                      fontSize: '18px'
                    }}
                  >
                    <FaDirections />
                  </button>
                  <a
                    href={`/accommodations/${accommodation.id}`}
                    style={{
                      color: '#4f46e5',
                      textDecoration: 'none',
                      fontSize: '14px'
                    }}
                  >
                    Xem chi tiết
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Route Instructions */}
      {selectedAccommodation && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'white',
          padding: '15px 20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <p style={{ margin: '0 0 10px 0' }}>
            Click vào bản đồ để chỉ đường đến <strong>{selectedAccommodation.name}</strong>
          </p>
          <button
            onClick={() => setSelectedAccommodation(null)}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              background: '#ef4444',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Đóng
          </button>
        </div>
      )}
    </div>
  );
};

export default Map; 