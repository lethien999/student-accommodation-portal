import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import { FaFilter, FaTimes } from 'react-icons/fa';
import amenityService from '../services/amenityService';
import './SearchFilters.css';

const SearchFilters = ({ onFilterChange, currentFilters = {} }) => {
  const [filters, setFilters] = useState({
    priceRange: currentFilters.priceRange || '',
    location: currentFilters.location || '',
    amenities: currentFilters.amenities || [],
    roomType: currentFilters.roomType || '',
    area: currentFilters.area || '',
    minPrice: currentFilters.minPrice || '',
    maxPrice: currentFilters.maxPrice || '',
    rating: currentFilters.rating || '',
    status: currentFilters.status || 'available'
  });

  const [amenitiesList, setAmenitiesList] = useState([]);
  const [loadingAmenities, setLoadingAmenities] = useState(true);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const data = await amenityService.getAmenities();
        setAmenitiesList(data);
      } catch (error) {
        console.error('Error fetching amenities:', error);
        // Fallback to default amenities if API fails
        setAmenitiesList([
          { id: 1, name: 'Wifi' },
          { id: 2, name: 'Điều hòa' },
          { id: 3, name: 'Nóng lạnh' },
          { id: 4, name: 'Giường' },
          { id: 5, name: 'Tủ' },
          { id: 6, name: 'Bàn học' },
          { id: 7, name: 'Tủ lạnh' },
          { id: 8, name: 'Máy giặt' },
          { id: 9, name: 'Ban công' },
          { id: 10, name: 'Camera an ninh' },
          { id: 11, name: 'Gác xép' },
          { id: 12, name: 'Nhà bếp' },
          { id: 13, name: 'Nhà vệ sinh riêng' },
          { id: 14, name: 'Chỗ để xe' },
          { id: 15, name: 'Thang máy' }
        ]);
      } finally {
        setLoadingAmenities(false);
      }
    };

    fetchAmenities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...filters,
      [name]: value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAmenityChange = (amenityName) => {
    const newAmenities = filters.amenities.includes(amenityName)
      ? filters.amenities.filter(a => a !== amenityName)
      : [...filters.amenities, amenityName];
    
    const newFilters = {
      ...filters,
      amenities: newAmenities
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePriceRangeChange = (range) => {
    let minPrice = '';
    let maxPrice = '';
    
    switch (range) {
      case '0-2000000':
        minPrice = '0';
        maxPrice = '2000000';
        break;
      case '2000000-3000000':
        minPrice = '2000000';
        maxPrice = '3000000';
        break;
      case '3000000-4000000':
        minPrice = '3000000';
        maxPrice = '4000000';
        break;
      case '4000000-5000000':
        minPrice = '4000000';
        maxPrice = '5000000';
        break;
      case '5000000+':
        minPrice = '5000000';
        maxPrice = '';
        break;
      default:
        minPrice = '';
        maxPrice = '';
    }

    const newFilters = {
      ...filters,
      priceRange: range,
      minPrice,
      maxPrice
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      priceRange: '',
      location: '',
      amenities: [],
      roomType: '',
      area: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      status: 'available'
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange) count++;
    if (filters.location) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.roomType) count++;
    if (filters.area) count++;
    if (filters.rating) count++;
    if (filters.status !== 'available') count++;
    return count;
  };

  return (
    <Card className="search-filters">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <FaFilter className="me-2" />
          Bộ lọc nâng cao
          {getActiveFiltersCount() > 0 && (
            <Badge bg="primary" className="ms-2">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </h6>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={clearFilters}
          disabled={getActiveFiltersCount() === 0}
        >
          <FaTimes className="me-1" />
          Xóa tất cả
        </Button>
      </Card.Header>
      <Card.Body>
        <Row>
      {/* Price Range */}
          <Col md={6} lg={3} className="mb-3">
            <Form.Group>
              <Form.Label>Khoảng giá</Form.Label>
              <Form.Select
          name="priceRange"
          value={filters.priceRange}
                onChange={(e) => handlePriceRangeChange(e.target.value)}
        >
          <option value="">Tất cả</option>
          <option value="0-2000000">Dưới 2 triệu</option>
          <option value="2000000-3000000">2 - 3 triệu</option>
          <option value="3000000-4000000">3 - 4 triệu</option>
          <option value="4000000-5000000">4 - 5 triệu</option>
          <option value="5000000+">Trên 5 triệu</option>
              </Form.Select>
            </Form.Group>
          </Col>

      {/* Location */}
          <Col md={6} lg={3} className="mb-3">
            <Form.Group>
              <Form.Label>Khu vực</Form.Label>
              <Form.Control
          type="text"
          name="location"
                placeholder="Nhập khu vực..."
          value={filters.location}
          onChange={handleChange}
        />
            </Form.Group>
          </Col>

      {/* Room Type */}
          <Col md={6} lg={3} className="mb-3">
            <Form.Group>
              <Form.Label>Loại phòng</Form.Label>
              <Form.Select
          name="roomType"
          value={filters.roomType}
          onChange={handleChange}
        >
          <option value="">Tất cả</option>
          <option value="single">Phòng đơn</option>
          <option value="double">Phòng đôi</option>
          <option value="triple">Phòng ba</option>
          <option value="studio">Studio</option>
                <option value="apartment">Căn hộ</option>
              </Form.Select>
            </Form.Group>
          </Col>

      {/* Area */}
          <Col md={6} lg={3} className="mb-3">
            <Form.Group>
              <Form.Label>Diện tích</Form.Label>
              <Form.Select
          name="area"
          value={filters.area}
          onChange={handleChange}
        >
          <option value="">Tất cả</option>
          <option value="0-20">Dưới 20m²</option>
          <option value="20-30">20 - 30m²</option>
          <option value="30-40">30 - 40m²</option>
          <option value="40+">Trên 40m²</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Rating */}
          <Col md={6} lg={3} className="mb-3">
            <Form.Group>
              <Form.Label>Đánh giá tối thiểu</Form.Label>
              <Form.Select
                name="rating"
                value={filters.rating}
                onChange={handleChange}
              >
                <option value="">Tất cả</option>
                <option value="4">4 sao trở lên</option>
                <option value="3">3 sao trở lên</option>
                <option value="2">2 sao trở lên</option>
                <option value="1">1 sao trở lên</option>
              </Form.Select>
            </Form.Group>
          </Col>

          {/* Status */}
          <Col md={6} lg={3} className="mb-3">
            <Form.Group>
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleChange}
              >
                <option value="available">Còn trống</option>
                <option value="unavailable">Đã cho thuê</option>
                <option value="all">Tất cả</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

      {/* Amenities */}
        <Row>
          <Col>
            <Form.Group>
              <Form.Label>Tiện ích</Form.Label>
              {loadingAmenities ? (
                <div className="text-muted">Đang tải tiện ích...</div>
              ) : (
                <div className="amenities-grid">
          {amenitiesList.map(amenity => (
                    <Form.Check
                      key={amenity.id || amenity.name}
                type="checkbox"
                      id={`amenity-${amenity.id || amenity.name}`}
                      label={amenity.name}
                      checked={filters.amenities.includes(amenity.name)}
                      onChange={() => handleAmenityChange(amenity.name)}
                      className="amenity-checkbox"
                    />
          ))}
        </div>
              )}
            </Form.Group>
          </Col>
        </Row>

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <Row className="mt-3">
            <Col>
              <div className="active-filters">
                <small className="text-muted me-2">Bộ lọc đang áp dụng:</small>
                {filters.priceRange && (
                  <Badge bg="info" className="me-1">
                    Giá: {filters.priceRange}
                  </Badge>
                )}
                {filters.location && (
                  <Badge bg="info" className="me-1">
                    Khu vực: {filters.location}
                  </Badge>
                )}
                {filters.roomType && (
                  <Badge bg="info" className="me-1">
                    Loại: {filters.roomType}
                  </Badge>
                )}
                {filters.area && (
                  <Badge bg="info" className="me-1">
                    Diện tích: {filters.area}
                  </Badge>
                )}
                {filters.rating && (
                  <Badge bg="info" className="me-1">
                    Đánh giá: {filters.rating}+ sao
                  </Badge>
                )}
                {filters.amenities.length > 0 && (
                  <Badge bg="info" className="me-1">
                    Tiện ích: {filters.amenities.length} mục
                  </Badge>
                )}
      </div>
            </Col>
          </Row>
        )}
      </Card.Body>
    </Card>
  );
};

export default SearchFilters; 