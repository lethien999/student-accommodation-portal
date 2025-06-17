import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { SearchControl, OpenStreetMapProvider } from 'react-leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { FaStar, FaDirections, FaFilter } from 'react-icons/fa';

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

const Map = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAccommodation, setSelectedAccommodation] = useState(null);
  const mapRef = useRef(null);

  // Default center position (Ho Chi Minh City)
  const defaultPosition = [10.762622, 106.660172];

  useEffect(() => {
    const fetchAccommodations = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/accommodations');
        setAccommodations(response.data);
        setFilteredAccommodations(response.data);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ height: '100vh', width: '100%', position: 'relative' }}>
      {/* Search and Filter Controls */}
      <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1000, background: 'white', padding: '10px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          style={{ marginBottom: '10px', padding: '5px 10px' }}
        >
          <FaFilter /> Filters
        </button>
        
        {showFilters && (
          <div style={{ marginTop: '10px' }}>
            <h4>Price Range</h4>
            <input
              type="range"
              min="0"
              max="1000000"
              step="100000"
              value={priceRange.max}
              onChange={(e) => handlePriceFilter(priceRange.min, parseInt(e.target.value))}
            />
            <div>Max Price: ${priceRange.max}</div>
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
        
        <SearchControl
          provider={new OpenStreetMapProvider()}
          showMarker={true}
          showPopup={false}
          popupFormat={({ query, result }) => result.label}
          maxMarkers={3}
          retainZoomLevel={false}
          animateZoom={true}
          autoClose={true}
          searchGeosearch={true}
        />

        <MapEvents onMapClick={handleMapClick} />
        
        {filteredAccommodations.map((accommodation) => (
          <Marker
            key={accommodation.id}
            position={[accommodation.latitude || defaultPosition[0], accommodation.longitude || defaultPosition[1]]}
            icon={favorites.includes(accommodation.id) ? favoriteIcon : L.Icon.Default}
          >
            <Popup>
              <div>
                <h3>{accommodation.name}</h3>
                <p><strong>Address:</strong> {accommodation.address}</p>
                <p><strong>Price:</strong> ${accommodation.price}/month</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    onClick={() => toggleFavorite(accommodation.id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      cursor: 'pointer',
                      color: favorites.includes(accommodation.id) ? 'gold' : 'gray'
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
                      color: 'blue'
                    }}
                  >
                    <FaDirections />
                  </button>
                  <a href={`/accommodations/${accommodation.id}`}>View Details</a>
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
          padding: '10px', 
          borderRadius: '5px', 
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <p>Click on the map to get directions to {selectedAccommodation.name}</p>
          <button onClick={() => setSelectedAccommodation(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Map; 