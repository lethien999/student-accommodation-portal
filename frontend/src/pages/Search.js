import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaSearch, FaMapMarkerAlt, FaFilter, FaSort, FaEye } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import accommodationService from '../services/accommodationService';
import amenityService from '../services/amenityService';
import favoriteService from '../services/favoriteService';
import AccommodationCard from '../components/AccommodationCard';
import SearchFilters from '../components/SearchFilters';
import MapView from './Map';
import { useAuth } from '../contexts/AuthContext';

const Search = () => {
  const { user } = useAuth();
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [amenities, setAmenities] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  
  // Search and filter state
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    roomType: '',
    amenities: [],
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  // Load amenities for filter
  useEffect(() => {
    const loadAmenities = async () => {
      try {
        const data = await amenityService.getAmenities();
        setAmenities(data);
      } catch (error) {
        console.error('Error loading amenities:', error);
      }
    };
    loadAmenities();
  }, []);

  // Load user favorites
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const data = await favoriteService.getFavorites();
          const favoriteIds = new Set(data.map(fav => fav.accommodationId || fav.id));
          setFavorites(favoriteIds);
        } catch (error) {
          console.error('Error loading favorites:', error);
        }
      }
    };
    loadFavorites();
  }, [user]);

  // Search accommodations
  const searchAccommodations = useCallback(async (params = searchParams) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await accommodationService.searchAccommodations(params);
      
      setAccommodations(response.accommodations || []);
      setPagination({
        currentPage: response.currentPage || 1,
        totalPages: response.totalPages || 1,
        totalItems: response.total || 0
      });
    } catch (err) {
      setError('Lỗi khi tìm kiếm nhà trọ. Vui lòng thử lại.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Initial search
  useEffect(() => {
    searchAccommodations();
  }, [searchAccommodations]);

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => ({ ...prev, page: 1 }));
    searchAccommodations({ ...searchParams, page: 1 });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    const updatedParams = { ...searchParams, ...newFilters, page: 1 };
    setSearchParams(updatedParams);
    searchAccommodations(updatedParams);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    const updatedParams = { ...searchParams, page };
    setSearchParams(updatedParams);
    searchAccommodations(updatedParams);
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (accommodationId) => {
    if (!user) {
      // Redirect to login or show login modal
      return;
    }

    try {
      const isCurrentlyFavorite = favorites.has(accommodationId);
      
      if (isCurrentlyFavorite) {
        await favoriteService.removeFromFavorites(accommodationId);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(accommodationId);
          return newSet;
        });
      } else {
        await favoriteService.addToFavorites(accommodationId);
        setFavorites(prev => new Set([...prev, accommodationId]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Handle sort change
  const handleSortChange = (sortBy, sortOrder) => {
    const updatedParams = { ...searchParams, sortBy, sortOrder, page: 1 };
    setSearchParams(updatedParams);
    searchAccommodations(updatedParams);
  };

  return (
    <>
      <Helmet>
        <title>Tìm kiếm nhà trọ - Student Accommodation Portal</title>
        <meta name="description" content="Tìm kiếm nhà trọ phù hợp với nhu cầu của bạn" />
      </Helmet>

      <Container fluid className="mt-4">
        {/* Search Header */}
        <Row className="mb-4">
          <Col>
            <h2 className="mb-3">
              <FaSearch className="me-2" />
              Tìm kiếm nhà trọ
            </h2>
            <p className="text-muted">
              Tìm thấy {pagination.totalItems} nhà trọ phù hợp
            </p>
          </Col>
        </Row>

        {/* Search Form */}
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Body>
                <Form onSubmit={handleSearch}>
                  <Row>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label>Từ khóa</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Tìm theo tên, địa chỉ, mô tả..."
                          value={searchParams.keyword}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, keyword: e.target.value }))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label>Địa điểm</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Quận, thành phố..."
                          value={searchParams.location}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Giá tối thiểu</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={searchParams.minPrice}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, minPrice: e.target.value }))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                      <Form.Group>
                        <Form.Label>Giá tối đa</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Không giới hạn"
                          value={searchParams.maxPrice}
                          onChange={(e) => setSearchParams(prev => ({ ...prev, maxPrice: e.target.value }))}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={1}>
                      <Form.Group>
                        <Form.Label>&nbsp;</Form.Label>
                        <Button type="submit" variant="primary" className="w-100">
                          <FaSearch />
                        </Button>
                      </Form.Group>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filters and View Toggle */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter className="me-1" />
                  Bộ lọc nâng cao
                </Button>
                <div className="btn-group" role="group">
                  <Button 
                    variant={viewMode === 'grid' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <FaEye />
                  </Button>
                  <Button 
                    variant={viewMode === 'map' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    onClick={() => setViewMode('map')}
                  >
                    <FaMapMarkerAlt />
                  </Button>
                </div>
              </div>
              
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">Sắp xếp:</span>
                <div className="btn-group" role="group">
                  <Button 
                    variant={searchParams.sortBy === 'price' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    onClick={() => handleSortChange('price', searchParams.sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    Giá <FaSort />
                  </Button>
                  <Button 
                    variant={searchParams.sortBy === 'createdAt' ? 'primary' : 'outline-primary'} 
                    size="sm"
                    onClick={() => handleSortChange('createdAt', searchParams.sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    Mới nhất <FaSort />
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* Advanced Filters */}
        {showFilters && (
          <Row className="mb-4">
            <Col>
              <SearchFilters 
                amenities={amenities}
                onFilterChange={handleFilterChange}
                currentFilters={searchParams}
              />
            </Col>
          </Row>
        )}

        {/* Search Results */}
        {error && (
          <Alert variant="danger" onClose={() => setError('')} dismissible>
            {error}
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Đang tìm kiếm nhà trọ...</p>
          </div>
        ) : viewMode === 'map' ? (
          <MapView accommodations={accommodations} />
        ) : (
          <>
            {/* Results Grid */}
            <Row>
              {accommodations.length === 0 ? (
                <Col>
                  <div className="text-center py-5">
                    <FaSearch size={48} className="text-muted mb-3" />
                    <h5>Không tìm thấy nhà trọ phù hợp</h5>
                    <p className="text-muted">Hãy thử thay đổi tiêu chí tìm kiếm</p>
                  </div>
                </Col>
              ) : (
                accommodations.map(accommodation => (
                  <Col key={accommodation.id} lg={4} md={6} className="mb-4">
                    <AccommodationCard 
                      accommodation={accommodation}
                      onFavoriteToggle={handleFavoriteToggle}
                      isFavorite={favorites.has(accommodation.id)}
                    />
                  </Col>
                ))
              )}
            </Row>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Row className="mt-4">
                <Col>
                  <nav aria-label="Search results pagination">
                    <ul className="pagination justify-content-center">
                      <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(pagination.currentPage - 1)}
                          disabled={pagination.currentPage === 1}
                        >
                          Trước
                        </button>
                      </li>
                      
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <li key={page} className={`page-item ${page === pagination.currentPage ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        );
                      })}
                      
                      <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(pagination.currentPage + 1)}
                          disabled={pagination.currentPage === pagination.totalPages}
                        >
                          Sau
                        </button>
                      </li>
                    </ul>
                  </nav>
                </Col>
              </Row>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default Search; 