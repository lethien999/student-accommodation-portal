import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Alert, Spinner, Form } from 'react-bootstrap';
import { FaSearch, FaTrash, FaEye, FaHeart, FaMapMarkerAlt, FaMoneyBillWave, FaStar } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import accommodationService from '../services/accommodationService';
import favoriteService from '../services/favoriteService';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';

const CompareAccommodations = () => {
  const { user } = useAuth();
  const [selectedAccommodations, setSelectedAccommodations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [favorites, setFavorites] = useState(new Set());
  const { formatCurrency } = useCurrency();

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
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;

    try {
      setSearchLoading(true);
      const response = await accommodationService.searchAccommodations({
        keyword: searchKeyword,
        limit: 10
      });
      setSearchResults(response.accommodations || []);
    } catch (error) {
      setError('Lỗi khi tìm kiếm nhà trọ');
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Add accommodation to comparison
  const addToComparison = (accommodation) => {
    if (selectedAccommodations.length >= 4) {
      setError('Bạn chỉ có thể so sánh tối đa 4 nhà trọ cùng lúc');
      return;
    }
    
    if (selectedAccommodations.find(acc => acc.id === accommodation.id)) {
      setError('Nhà trọ này đã có trong danh sách so sánh');
      return;
    }

    setSelectedAccommodations(prev => [...prev, accommodation]);
    setError('');
  };

  // Remove accommodation from comparison
  const removeFromComparison = (accommodationId) => {
    setSelectedAccommodations(prev => prev.filter(acc => acc.id !== accommodationId));
  };

  // Handle favorite toggle
  const handleFavoriteToggle = async (accommodationId) => {
    if (!user) {
      setError('Vui lòng đăng nhập để thêm vào yêu thích');
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

  // Clear all comparisons
  const clearComparison = () => {
    setSelectedAccommodations([]);
  };

  // Get comparison data
  const getComparisonData = () => {
    const comparisonFields = [
      { key: 'title', label: 'Tên nhà trọ', type: 'text' },
      { key: 'address', label: 'Địa chỉ', type: 'text' },
      { key: 'price', label: 'Giá thuê', type: 'price' },
      { key: 'area', label: 'Diện tích', type: 'text' },
      { key: 'roomType', label: 'Loại phòng', type: 'text' },
      { key: 'amenities', label: 'Tiện ích', type: 'list' },
      { key: 'rating', label: 'Đánh giá', type: 'rating' },
      { key: 'reviewCount', label: 'Số đánh giá', type: 'number' },
      { key: 'owner', label: 'Chủ nhà', type: 'text' },
      { key: 'status', label: 'Trạng thái', type: 'status' }
    ];

    return comparisonFields.map(field => {
      const row = { field: field.label, type: field.type };
      selectedAccommodations.forEach(acc => {
        let value = acc[field.key];
        
        if (field.key === 'owner') {
          value = acc.accommodationOwner?.username || 'N/A';
        } else if (field.key === 'amenities') {
          value = Array.isArray(acc.amenities) ? acc.amenities.join(', ') : 'N/A';
        } else if (field.key === 'roomType') {
          value = Array.isArray(acc.roomType)
            ? acc.roomType.join(', ')
            : acc.roomType
              ? acc.roomType
              : 'N/A';
        } else if (field.key === 'price') {
          value = value ? formatCurrency(value) : 'N/A';
        } else if (field.key === 'rating') {
          value = value || 0;
        } else if (field.key === 'status') {
          value = acc.status === 'available' ? 'Còn trống' : 'Đã cho thuê';
        }
        
        row[`acc_${acc.id}`] = value;
      });
      return row;
    });
  };

  return (
    <>
      <Helmet>
        <title>So sánh nhà trọ - Student Accommodation Portal</title>
        <meta name="description" content="So sánh các nhà trọ để chọn lựa phù hợp nhất" />
      </Helmet>

      <Container fluid className="mt-4">
        {/* Header */}
        <Row className="mb-4">
          <Col>
            <h2 className="mb-3">So sánh nhà trọ</h2>
            <p className="text-muted">
              Chọn tối đa 4 nhà trọ để so sánh chi tiết
            </p>
          </Col>
        </Row>

        {/* Search Section */}
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <FaSearch className="me-2" />
                  Tìm kiếm nhà trọ để so sánh
                </h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSearch}>
                  <Row>
                    <Col md={8}>
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên nhà trọ, địa chỉ hoặc từ khóa..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                      />
                    </Col>
                    <Col md={4}>
                      <Button 
                        type="submit" 
                        variant="primary" 
                        className="w-100"
                        disabled={searchLoading}
                      >
                        {searchLoading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Đang tìm...
                          </>
                        ) : (
                          <>
                            <FaSearch className="me-2" />
                            Tìm kiếm
                          </>
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-3">
                    <h6>Kết quả tìm kiếm:</h6>
                    <Row>
                      {searchResults.map(acc => (
                        <Col key={acc.id} md={6} lg={4} className="mb-3">
                          <Card className="h-100">
                            <Card.Body>
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="card-title mb-0">{acc.title}</h6>
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => addToComparison(acc)}
                                  disabled={selectedAccommodations.length >= 4}
                                >
                                  Thêm
                                </Button>
                              </div>
                              <p className="text-muted small mb-2">
                                <FaMapMarkerAlt className="me-1" />
                                {acc.address}
                              </p>
                              <p className="text-primary mb-2">
                                <FaMoneyBillWave className="me-1" />
                                {acc.price?.toLocaleString('vi-VN')}đ/tháng
                              </p>
                              {acc.rating && (
                                <div className="d-flex align-items-center">
                                  <FaStar className="text-warning me-1" />
                                  <span className="small">{acc.rating}/5</span>
                                </div>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Error Display */}
        {error && (
          <Row className="mb-4">
            <Col>
              <Alert variant="danger" onClose={() => setError('')} dismissible>
                {error}
              </Alert>
            </Col>
          </Row>
        )}

        {/* Comparison Section */}
        {selectedAccommodations.length > 0 && (
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">
                    Bảng so sánh ({selectedAccommodations.length}/4)
                  </h5>
                  <Button variant="outline-danger" size="sm" onClick={clearComparison}>
                    <FaTrash className="me-1" />
                    Xóa tất cả
                  </Button>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <Table className="comparison-table">
                      <thead>
                        <tr>
                          <th style={{ minWidth: '200px' }}>Tiêu chí</th>
                          {selectedAccommodations.map(acc => (
                            <th key={acc.id} style={{ minWidth: '250px' }}>
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="mb-1">{acc.title}</h6>
                                  <p className="text-muted small mb-2">{acc.address}</p>
                                  <div className="d-flex gap-1 mb-2">
                                    <Button
                                      size="sm"
                                      variant="outline-primary"
                                      as={Link}
                                      to={`/accommodations/${acc.id}`}
                                    >
                                      <FaEye />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={favorites.has(acc.id) ? "danger" : "outline-danger"}
                                      onClick={() => handleFavoriteToggle(acc.id)}
                                    >
                                      <FaHeart />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline-secondary"
                                      onClick={() => removeFromComparison(acc.id)}
                                    >
                                      <FaTrash />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {getComparisonData().map((row, index) => (
                          <tr key={index}>
                            <td className="fw-bold">{row.field}</td>
                            {selectedAccommodations.map(acc => {
                              const value = row[`acc_${acc.id}`];
                              
                              if (row.type === 'rating') {
                                return (
                                  <td key={acc.id}>
                                    <div className="d-flex align-items-center">
                                      <FaStar className="text-warning me-1" />
                                      <span>{value}/5</span>
                                    </div>
                                  </td>
                                );
                              } else if (row.type === 'status') {
                                return (
                                  <td key={acc.id}>
                                    <Badge bg={value === 'Còn trống' ? 'success' : 'secondary'}>
                                      {value}
                                    </Badge>
                                  </td>
                                );
                              } else if (row.type === 'list') {
                                return (
                                  <td key={acc.id}>
                                    <div className="small">
                                      {value.split(', ').map((item, i) => (
                                        <Badge key={i} bg="light" text="dark" className="me-1 mb-1">
                                          {item}
                                        </Badge>
                                      ))}
                                    </div>
                                  </td>
                                );
                              } else {
                                return (
                                  <td key={acc.id}>{value || 'N/A'}</td>
                                );
                              }
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Empty State */}
        {selectedAccommodations.length === 0 && (
          <Row>
            <Col className="text-center">
              <Card>
                <Card.Body>
                  <h5 className="text-muted">Chưa có nhà trọ nào được chọn để so sánh</h5>
                  <p className="text-muted">
                    Sử dụng thanh tìm kiếm ở trên để tìm và thêm nhà trọ vào danh sách so sánh
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
};

export default CompareAccommodations; 