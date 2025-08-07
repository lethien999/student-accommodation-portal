import React, { useState, useEffect } from 'react';
import { Button, Nav, Card, Row, Col, Spinner, Alert, Form, Table, Badge } from 'react-bootstrap';
import { FaHome, FaSearch, FaHeart, FaHistory, FaEnvelope, FaBell, FaRobot, FaEye } from 'react-icons/fa';
import accommodationService from '../services/accommodationService';
import favoriteService from '../services/favoriteService';
import messageService from '../services/messageService';
import userService from '../services/userService';
import AccommodationCard from '../components/AccommodationCard';
import Chat from '../components/Chat';
import './TenantDashboard.css';

const SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Tổng quan', icon: <FaHome /> },
  { key: 'search', label: 'Tìm kiếm', icon: <FaSearch /> },
  { key: 'favorites', label: 'Yêu thích', icon: <FaHeart /> },
  { key: 'history', label: 'Lịch sử đặt phòng', icon: <FaHistory /> },
  { key: 'messages', label: 'Tin nhắn', icon: <FaEnvelope /> },
  { key: 'notification', label: 'Thông báo', icon: <FaBell /> },
  { key: 'chatbot', label: 'Chatbot AI', icon: <FaRobot /> },
];

const TenantDashboard = () => {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dashboard stats
  const [stats, setStats] = useState({
    favorites: { count: 0 },
    bookings: { count: 0 },
    reviews: { count: 0 }
  });
  
  // Search functionality
  const [searchResults, setSearchResults] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  });
  
  // Favorites
  const [favorites, setFavorites] = useState([]);
  
  // Booking history
  const [bookingHistory, setBookingHistory] = useState([]);
  
  // Conversations
  const [conversations, setConversations] = useState([]);

  // 1. Thêm state nhận diện mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (sidebarTab === 'dashboard') {
        try {
          setLoading(true);
          const data = await userService.getTenantDashboardStats();
          setStats(data.stats);
        } catch (error) {
          console.error('Error fetching dashboard stats:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchDashboardStats();
  }, [sidebarTab]);

  // Load favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (sidebarTab === 'favorites') {
        try {
          setLoading(true);
          const data = await favoriteService.getFavorites();
          setFavorites(data);
        } catch (error) {
          console.error('Error fetching favorites:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchFavorites();
  }, [sidebarTab]);

  // Load booking history
  useEffect(() => {
    const fetchBookingHistory = async () => {
      if (sidebarTab === 'history') {
        try {
          setLoading(true);
          const data = await userService.getBookingHistory();
          setBookingHistory(data);
        } catch (error) {
          console.error('Error fetching booking history:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchBookingHistory();
  }, [sidebarTab]);

  // Load messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (sidebarTab === 'messages') {
        try {
          setLoading(true);
          const data = await messageService.getConversations();
          setConversations(data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchMessages();
  }, [sidebarTab]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await accommodationService.searchAccommodations(searchFilters);
      setSearchResults(data.accommodations || []);
    } catch (error) {
      setError('Lỗi khi tìm kiếm nhà trọ.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (accommodationId) => {
    try {
      await favoriteService.removeFromFavorites(accommodationId);
      setFavorites(prev => prev.filter(fav => fav.id !== accommodationId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleFilterChange = (e) => {
    setSearchFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="tenant-layout d-flex">
      {/* Sidebar trái */}
      <div className="sidebar bg-light border-end d-flex flex-column p-0" style={{ minWidth: isMobile ? '100%' : 220, minHeight: isMobile ? 'auto' : '100vh', position: isMobile ? 'static' : 'sticky', top: 0 }}>
        <div className="sidebar-header text-center py-4 border-bottom">
          <h4 className="mb-0">Tenant</h4>
          <small className="text-muted">Người thuê</small>
        </div>
        {isMobile ? (
          <Nav className="flex-row justify-content-around mt-2" variant="pills" activeKey={sidebarTab}>
            {SIDEBAR_ITEMS.filter(item => ['dashboard','search','favorites','history','messages'].includes(item.key)).map(item => (
              <Nav.Link key={item.key} eventKey={item.key} onClick={() => setSidebarTab(item.key)} className="d-flex flex-column align-items-center px-2 py-1">
                <span className="mb-1">{item.icon}</span> <small>{item.label}</small>
              </Nav.Link>
            ))}
          </Nav>
        ) : (
          <Nav className="flex-column mt-3" variant="pills" activeKey={sidebarTab}>
            {SIDEBAR_ITEMS.map(item => (
              <Nav.Link key={item.key} eventKey={item.key} onClick={() => setSidebarTab(item.key)} className="d-flex align-items-center px-3 py-2">
                <span className="me-2">{item.icon}</span> {item.label}
              </Nav.Link>
            ))}
          </Nav>
        )}
        <div className="mt-auto p-3 border-top text-center">
          <Button variant="outline-danger" size="sm" onClick={() => window.location.href = '/'}>Đăng xuất</Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow-1 p-4" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="dashboard-title mb-1">Tenant Dashboard</h2>
            <p className="dashboard-subtitle text-muted mb-0">Quản lý tìm kiếm, yêu thích, lịch sử đặt phòng, tin nhắn</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button variant="outline-secondary" size="sm" onClick={() => setSidebarTab('notification')}><FaBell /></Button>
            <Button variant="outline-primary" size="sm" onClick={() => setSidebarTab('chatbot')}><FaRobot /></Button>
          </div>
        </div>

        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

        {/* Dashboard Overview */}
        {sidebarTab === 'dashboard' && (
          <>
            {loading ? (
              <div className="text-center"><Spinner animation="border" /></div>
            ) : (
              <Row>
                <Col md={4}>
                  <Card className="text-center p-3 shadow-sm">
                    <Card.Body>
                      <FaHeart size={40} className="text-danger mb-3" />
                      <Card.Title as="h3">{stats.favorites.count}</Card.Title>
                      <Card.Text className="text-muted">Nhà trọ yêu thích</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center p-3 shadow-sm">
                    <Card.Body>
                      <FaHistory size={40} className="text-primary mb-3" />
                      <Card.Title as="h3">{stats.bookings.count}</Card.Title>
                      <Card.Text className="text-muted">Lịch sử đặt phòng</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center p-3 shadow-sm">
                    <Card.Body>
                      <FaEnvelope size={40} className="text-success mb-3" />
                      <Card.Title as="h3">{stats.reviews.count}</Card.Title>
                      <Card.Text className="text-muted">Đánh giá đã viết</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </>
        )}

        {/* Search Tab */}
        {sidebarTab === 'search' && (
          <>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Tìm kiếm nhà trọ</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handleSearch}>
                  <Row>
                    <Col md={3}>
                      <Form.Control
                        type="text"
                        name="keyword"
                        placeholder="Từ khóa..."
                        value={searchFilters.keyword}
                        onChange={handleFilterChange}
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Control
                        type="text"
                        name="location"
                        placeholder="Địa điểm..."
                        value={searchFilters.location}
                        onChange={handleFilterChange}
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="number"
                        name="minPrice"
                        placeholder="Giá tối thiểu"
                        value={searchFilters.minPrice}
                        onChange={handleFilterChange}
                      />
                    </Col>
                    <Col md={2}>
                      <Form.Control
                        type="number"
                        name="maxPrice"
                        placeholder="Giá tối đa"
                        value={searchFilters.maxPrice}
                        onChange={handleFilterChange}
                      />
                    </Col>
                    <Col md={2}>
                      <Button type="submit" className="w-100" disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Tìm kiếm'}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            {loading ? (
              <div className="text-center"><Spinner animation="border" /></div>
            ) : searchResults.length > 0 ? (
              <Row>
                {searchResults.map(acc => (
                  <Col key={acc.id} lg={4} md={6} className="mb-4">
                    <AccommodationCard 
                      accommodation={acc}
                      isFavorite={acc.isFavorite}
                      onFavoriteToggle={() => handleRemoveFavorite(acc.id)}
                    />
                  </Col>
                ))}
              </Row>
            ) : (
              <Alert variant="info">Không tìm thấy nhà trọ phù hợp.</Alert>
            )}
          </>
        )}

        {/* Favorites Tab */}
        {sidebarTab === 'favorites' && (
          <>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Danh sách yêu thích</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center"><Spinner animation="border" /></div>
                ) : favorites.length > 0 ? (
                  <Row>
                    {favorites.map(acc => (
                      <Col key={acc.id} lg={4} md={6} className="mb-4">
                        <AccommodationCard 
                          accommodation={acc}
                          isFavorite={true}
                          onFavoriteToggle={() => handleRemoveFavorite(acc.id)}
                        />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info">Bạn chưa có nhà trọ yêu thích nào.</Alert>
                )}
              </Card.Body>
            </Card>
          </>
        )}

        {/* Booking History Tab */}
        {sidebarTab === 'history' && (
          <>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Lịch sử đặt phòng</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center"><Spinner animation="border" /></div>
                ) : bookingHistory.length > 0 ? (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Nhà trọ</th>
                        <th>Ngày đặt</th>
                        <th>Trạng thái</th>
                        <th>Số tiền</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookingHistory.map(booking => (
                        <tr key={booking.id}>
                          <td>{booking.accommodation.title}</td>
                          <td>{new Date(booking.createdAt).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <Badge bg={booking.status === 'completed' ? 'success' : 'warning'}>
                              {booking.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                            </Badge>
                          </td>
                          <td>{booking.amount.toLocaleString('vi-VN')}đ</td>
                          <td>
                            <Button variant="outline-primary" size="sm">
                              <FaEye className="me-1" />Xem chi tiết
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="info">Bạn chưa có lịch sử đặt phòng nào.</Alert>
                )}
              </Card.Body>
            </Card>
          </>
        )}

        {/* Messages Tab */}
        {sidebarTab === 'messages' && (
          <>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Tin nhắn</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center"><Spinner animation="border" /></div>
                ) : conversations.length > 0 ? (
                  <div className="conversation-list">
                    {conversations.map(conversation => (
                      <div key={conversation.id} className="conversation-item p-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{conversation.participant.username}</h6>
                            <p className="text-muted mb-0">{conversation.lastMessage}</p>
                          </div>
                          <div className="text-end">
                            <small className="text-muted">{new Date(conversation.updatedAt).toLocaleDateString('vi-VN')}</small>
                            <br />
                            <Button variant="outline-primary" size="sm">
                              <FaEnvelope className="me-1" />Nhắn tin
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info">Bạn chưa có tin nhắn nào.</Alert>
                )}
              </Card.Body>
            </Card>
          </>
        )}

        {/* Notification Tab */}
        {sidebarTab === 'notification' && (
          <>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Thông báo</h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="info">Chức năng thông báo đang được phát triển.</Alert>
              </Card.Body>
            </Card>
          </>
        )}

        {/* Chatbot Tab */}
        {sidebarTab === 'chatbot' && (
          <>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Chatbot AI</h5>
              </Card.Header>
              <Card.Body>
                <Chat />
              </Card.Body>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default TenantDashboard; 