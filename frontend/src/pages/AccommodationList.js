import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Accordion, InputGroup } from 'react-bootstrap';
import accommodationService from '../services/accommodationService';
import amenityService from '../services/amenityService';
import favoriteService from '../services/favoriteService';
import AccommodationCard from '../components/AccommodationCard';
import MapView from './Map';
import { Helmet } from 'react-helmet-async';
import { FaSearch, FaSlidersH } from 'react-icons/fa';
import './AccommodationList.css';
import { useTranslation } from 'react-i18next';

const AccommodationList = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    keyword: '',
    minPrice: '',
    maxPrice: '',
    type: '',
    amenities: [],
    sortBy: 'createdAt_desc',
  });
  const [availableAmenities, setAvailableAmenities] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);
  const { t } = useTranslation();

  const fetchAmenities = async () => {
    try {
      const amenitiesData = await amenityService.getAmenities();
      setAvailableAmenities(amenitiesData);
    } catch (error) {
      console.error('Failed to fetch amenities:', error);
    }
  };
  
  const fetchAccommodations = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const cleanedFilters = { ...filters };
      if (!cleanedFilters.minPrice) delete cleanedFilters.minPrice;
      if (!cleanedFilters.maxPrice) delete cleanedFilters.maxPrice;
      if (cleanedFilters.amenities.length === 0) delete cleanedFilters.amenities;

      const data = await accommodationService.searchAccommodations(cleanedFilters);
      if (data && Array.isArray(data.accommodations)) {
        setAccommodations(data.accommodations);
      } else {
        setAccommodations([]);
        setError(data?.message || 'Không tìm thấy kết quả phù hợp hoặc có lỗi từ máy chủ.');
      }
    } catch (err) {
      setAccommodations([]);
      setError(err?.message || 'Lỗi khi tải danh sách nhà trọ.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAmenities();
    fetchAccommodations();
  }, [fetchAccommodations]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (e) => {
    const { value, checked } = e.target;
    setFilters(prev => {
      const newAmenities = checked
        ? [...prev.amenities, value]
        : prev.amenities.filter(a => a !== value);
      return { ...prev, amenities: newAmenities };
    });
  };

  const handleResetFilters = () => {
    setFilters({
      keyword: '',
      minPrice: '',
      maxPrice: '',
      type: '',
      amenities: [],
      sortBy: 'createdAt_desc',
    });
    // fetchAccommodations will be called automatically due to useEffect dependency on filters
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchAccommodations();
  };
  
  const handleFavoriteToggle = async (accommodationId, isCurrentlyFavorite) => {
    try {
      if (isCurrentlyFavorite) {
        await favoriteService.removeFromFavorites(accommodationId);
      } else {
        await favoriteService.addToFavorites(accommodationId);
      }
      // Re-fetch or optimistically update
      setAccommodations(prev => prev.map(acc => 
        acc.id === accommodationId ? { ...acc, isFavorite: !acc.isFavorite } : acc
      ));
    } catch (error) {
      console.error("Failed to update favorite status", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('Find Accommodation')} - Student Accommodation Portal</title>
      </Helmet>
      <Container fluid className="mt-4 accommodation-list-page">
        <Row>
          <Col md={7} className="accommodation-list-col">
            <Card className="filters-card p-3 mb-4 shadow-sm">
              <Form onSubmit={handleSearch}>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="text"
                    name="keyword"
                    placeholder={t('Search by address, district, city...')}
                    value={filters.keyword}
                    onChange={handleFilterChange}
                  />
                  <Button type="submit" variant="primary">
                    <FaSearch />
                  </Button>
                </InputGroup>
                
                <Accordion>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header>
                      <FaSlidersH className="me-2" /> {t('Advanced Filters')}
                    </Accordion.Header>
                    <Accordion.Body>
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>{t('Price Range (VND/month)')}</Form.Label>
                            <InputGroup>
                              <Form.Control type="number" name="minPrice" placeholder={t('From')} value={filters.minPrice} onChange={handleFilterChange} />
                              <Form.Control type="number" name="maxPrice" placeholder={t('To')} value={filters.maxPrice} onChange={handleFilterChange} />
                            </InputGroup>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                           <Form.Group className="mb-3">
                            <Form.Label>{t('Type')}</Form.Label>
                            <Form.Select name="type" value={filters.type} onChange={handleFilterChange}>
                              <option value="">{t('All')}</option>
                              <option value="room">{t('Room')}</option>
                              <option value="apartment">{t('Apartment')}</option>
                              <option value="house">{t('House')}</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('Amenities')}</Form.Label>
                        <div className="amenities-filter-list">
                          {availableAmenities.map(amenity => (
                            <Form.Check 
                              key={amenity.id}
                              type="checkbox"
                              id={`amenity-${amenity.id}`}
                              label={amenity.name}
                              value={amenity.name}
                              checked={filters.amenities.includes(amenity.name)}
                              onChange={handleAmenityChange}
                              inline
                            />
                          ))}
                        </div>
                      </Form.Group>
                      <div className="d-flex justify-content-end">
                        <Button variant="secondary" onClick={handleResetFilters} className="me-2">{t('Reset Filters')}</Button>
                        <Button variant="primary" onClick={handleSearch}>{t('Apply')}</Button>
                      </div>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </Form>
            </Card>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted">{t('Found {{count}} results', { count: accommodations.length })}</span>
              <Form.Select name="sortBy" value={filters.sortBy} onChange={handleFilterChange} style={{ width: '200px' }}>
                <option value="createdAt_desc">{t('Newest')}</option>
                <option value="price_asc">{t('Price Ascending')}</option>
                <option value="price_desc">{t('Price Descending')}</option>
                <option value="rating_desc">{t('Highest Rated')}</option>
              </Form.Select>
            </div>

            {loading && <div className="text-center py-5"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger">{t('Failed to load accommodation list.')}</Alert>}
            
            <div className="accommodation-list-scroll">
              <Row>
                {!loading && accommodations.length > 0 ? (
                  accommodations.map(acc => (
                    <Col 
                      key={acc.id} 
                      lg={6} 
                      className="mb-4"
                      onMouseEnter={() => setHighlightedId(acc.id)}
                      onMouseLeave={() => setHighlightedId(null)}
                    >
                      <AccommodationCard 
                        accommodation={acc}
                        isFavorite={acc.isFavorite}
                        onFavoriteToggle={() => handleFavoriteToggle(acc.id, acc.isFavorite)}
                      />
                    </Col>
                  ))
                ) : (
                  !loading && <Col><Alert variant="info">{t('No accommodations found matching your criteria.')}</Alert></Col>
                )}
              </Row>
            </div>
          </Col>

          <Col md={5} className="map-col d-none d-md-block">
            <MapView accommodations={accommodations} highlightedId={highlightedId} />
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AccommodationList; 