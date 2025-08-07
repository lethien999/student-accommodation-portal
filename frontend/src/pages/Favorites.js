import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import favoriteService from '../services/favoriteService';
import AccommodationCard from '../components/AccommodationCard';
import { Helmet } from 'react-helmet-async';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoriteService.getFavorites();
      setFavorites(data || []);
    } catch (err) {
      setError('Lỗi khi tải danh sách yêu thích.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleFavoriteUpdate = () => {
    // Re-fetch favorites when an item is removed from the list
    fetchFavorites();
  };

  return (
    <>
      <Helmet>
        <title>Danh sách yêu thích - Student Accommodation Portal</title>
      </Helmet>
      <Container className="mt-4">
        <h2 className="mb-4">Nhà trọ đã yêu thích</h2>
        {loading && <div className="text-center"><Spinner animation="border" /></div>}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loading && !error && (
          <Row>
            {favorites.length > 0 ? (
              favorites.map((fav) => (
                <Col key={fav.id} sm={12} md={6} lg={4} className="mb-4">
                  <AccommodationCard 
                    accommodation={fav.accommodation} 
                    isFavorite={true}
                    onFavoriteToggle={handleFavoriteUpdate}
                  />
                </Col>
              ))
            ) : (
              <Col>
                <Alert variant="info">Bạn chưa có nhà trọ yêu thích nào.</Alert>
              </Col>
            )}
          </Row>
        )}
      </Container>
    </>
  );
};

export default Favorites; 