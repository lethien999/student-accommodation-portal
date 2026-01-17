/**
 * TenantDashboard
 * 
 * Premium dashboard for tenants with cosmic sparkle theme.
 * Features: Search, favorites, booking history, messages, payments.
 * Follows Single Responsibility Principle - composed of smaller components.
 * 
 * @component
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Row, Col, Spinner, Form } from 'react-bootstrap';
import {
  FaHome, FaSearch, FaHeart, FaHistory, FaEnvelope,
  FaBell, FaRobot, FaEye, FaMoneyBillWave, FaFileContract
} from 'react-icons/fa';

// UI Components
import { DashboardLayout, StatCard, AnimatedButton } from '../components/ui';

// Services
import accommodationService from '../services/accommodationService';
import favoriteService from '../services/favoriteService';
import messageService from '../services/messageService';
import userService from '../services/userService';

// Components
import AccommodationCard from '../components/AccommodationCard';
import Chat from '../components/Chat';

// Sidebar menu items
const SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Tổng quan', icon: <FaHome /> },
  { key: 'search', label: 'Tìm phòng', icon: <FaSearch /> },
  { key: 'favorites', label: 'Yêu thích', icon: <FaHeart /> },
  { key: 'contracts', label: 'Hợp đồng', icon: <FaFileContract /> },
  { key: 'payments', label: 'Thanh toán', icon: <FaMoneyBillWave /> },
  { key: 'history', label: 'Lịch sử', icon: <FaHistory /> },
  { key: 'messages', label: 'Tin nhắn', icon: <FaEnvelope /> },
  { key: 'notification', label: 'Thông báo', icon: <FaBell /> },
  { key: 'chatbot', label: 'Chatbot AI', icon: <FaRobot /> },
];

const TenantDashboard = () => {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('dashboard');

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dashboard statistics
  const [stats, setStats] = useState({
    favorites: { count: 0 },
    bookings: { count: 0 },
    reviews: { count: 0 },
    pendingPayments: 0,
  });

  // Search functionality
  const [searchResults, setSearchResults] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    keyword: '',
    minPrice: '',
    maxPrice: '',
    location: ''
  });

  // Data lists
  const [favorites, setFavorites] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [conversations, setConversations] = useState([]);

  // User info (would come from auth context in production)
  const userInfo = {
    name: 'Người thuê',
    role: 'Tenant',
    avatar: null,
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getTenantDashboardStats();
      setStats(data.stats || {
        favorites: { count: 0 },
        bookings: { count: 0 },
        reviews: { count: 0 },
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch favorites
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      const data = await favoriteService.getFavorites();
      setFavorites(data);
    } catch (err) {
      console.error('Error fetching favorites:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch booking history
  const fetchBookingHistory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getBookingHistory();
      setBookingHistory(data);
    } catch (err) {
      console.error('Error fetching booking history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await messageService.getConversations();
      setConversations(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case 'dashboard':
        fetchDashboardStats();
        break;
      case 'favorites':
        fetchFavorites();
        break;
      case 'history':
        fetchBookingHistory();
        break;
      case 'messages':
        fetchMessages();
        break;
      default:
        break;
    }
  }, [activeTab, fetchDashboardStats, fetchFavorites, fetchBookingHistory, fetchMessages]);

  // Search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await accommodationService.searchAccommodations(searchFilters);
      setSearchResults(data.accommodations || []);
    } catch (err) {
      setError('Lỗi khi tìm kiếm nhà trọ.');
    } finally {
      setLoading(false);
    }
  };

  // Remove from favorites
  const handleRemoveFavorite = async (accommodationId) => {
    try {
      await favoriteService.removeFromFavorites(accommodationId);
      setFavorites(prev => prev.filter(fav => fav.id !== accommodationId));
    } catch (err) {
      console.error('Error removing favorite:', err);
    }
  };

  // Filter change handler
  const handleFilterChange = (e) => {
    setSearchFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    const variants = {
      completed: { bg: 'success', label: 'Hoàn thành' },
      pending: { bg: 'warning', label: 'Chờ xử lý' },
      cancelled: { bg: 'danger', label: 'Đã hủy' },
    };
    const config = variants[status] || { bg: 'secondary', label: status };
    return <span className={`badge-cosmic badge-cosmic--${config.bg}`}>{config.label}</span>;
  };

  // ========================== RENDER SECTIONS ==========================

  // Dashboard Overview Section
  const renderDashboard = () => (
    <>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
        </div>
      ) : (
        <>
          {/* Statistics Grid */}
          <div className="grid-stats mb-4">
            <StatCard
              title="Phòng yêu thích"
              value={stats.favorites?.count || 0}
              icon={<FaHeart />}
              color="danger"
            />
            <StatCard
              title="Lượt đặt phòng"
              value={stats.bookings?.count || 0}
              icon={<FaHistory />}
              color="primary"
            />
            <StatCard
              title="Đánh giá đã viết"
              value={stats.reviews?.count || 0}
              icon={<FaEnvelope />}
              color="success"
            />
            <StatCard
              title="Thanh toán chờ"
              value={stats.pendingPayments || 0}
              icon={<FaMoneyBillWave />}
              color="warning"
            />
          </div>

          {/* Quick Actions */}
          <div className="card-glass mb-4">
            <div className="card-glass__header">
              <h5 className="card-glass__title">Thao tác nhanh</h5>
            </div>
            <div className="d-flex flex-wrap gap-3">
              <AnimatedButton
                variant="primary"
                icon={<FaSearch />}
                onClick={() => setActiveTab('search')}
              >
                Tìm phòng trọ
              </AnimatedButton>
              <AnimatedButton
                variant="secondary"
                icon={<FaHeart />}
                onClick={() => setActiveTab('favorites')}
              >
                Xem yêu thích
              </AnimatedButton>
              <AnimatedButton
                variant="secondary"
                icon={<FaMoneyBillWave />}
                onClick={() => setActiveTab('payments')}
              >
                Thanh toán
              </AnimatedButton>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card-glass">
            <div className="card-glass__header">
              <h5 className="card-glass__title">Hoạt động gần đây</h5>
            </div>
            <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
              Chưa có hoạt động mới.
            </Alert>
          </div>
        </>
      )}
    </>
  );

  // Search Section
  const renderSearch = () => (
    <>
      <div className="card-glass mb-4">
        <div className="card-glass__header">
          <h5 className="card-glass__title">Tìm kiếm phòng trọ</h5>
        </div>
        <Form onSubmit={handleSearch}>
          <Row>
            <Col md={3} className="mb-3 mb-md-0">
              <Form.Control
                type="text"
                name="keyword"
                placeholder="Từ khóa..."
                value={searchFilters.keyword}
                onChange={handleFilterChange}
                className="bg-dark text-light border-secondary"
              />
            </Col>
            <Col md={3} className="mb-3 mb-md-0">
              <Form.Control
                type="text"
                name="location"
                placeholder="Địa điểm..."
                value={searchFilters.location}
                onChange={handleFilterChange}
                className="bg-dark text-light border-secondary"
              />
            </Col>
            <Col md={2} className="mb-3 mb-md-0">
              <Form.Control
                type="number"
                name="minPrice"
                placeholder="Giá tối thiểu"
                value={searchFilters.minPrice}
                onChange={handleFilterChange}
                className="bg-dark text-light border-secondary"
              />
            </Col>
            <Col md={2} className="mb-3 mb-md-0">
              <Form.Control
                type="number"
                name="maxPrice"
                placeholder="Giá tối đa"
                value={searchFilters.maxPrice}
                onChange={handleFilterChange}
                className="bg-dark text-light border-secondary"
              />
            </Col>
            <Col md={2}>
              <AnimatedButton
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
                icon={<FaSearch />}
              >
                Tìm kiếm
              </AnimatedButton>
            </Col>
          </Row>
        </Form>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="light" />
        </div>
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
        <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
          Nhập thông tin để tìm kiếm phòng trọ phù hợp.
        </Alert>
      )}
    </>
  );

  // Favorites Section
  const renderFavorites = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Danh sách yêu thích</h5>
      </div>
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="light" />
        </div>
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
        <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
          Bạn chưa có phòng trọ yêu thích nào.
        </Alert>
      )}
    </div>
  );

  // Contracts Section
  const renderContracts = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Hợp đồng thuê phòng</h5>
      </div>
      <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
        Tính năng xem hợp đồng sẽ được cập nhật sớm.
      </Alert>
    </div>
  );

  // Payments Section
  const renderPayments = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Thanh toán hàng tháng</h5>
      </div>
      <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
        Tính năng thanh toán trực tuyến sẽ được cập nhật sớm. Bạn sẽ nhận được mã thanh toán qua Zalo.
      </Alert>
    </div>
  );

  // Booking History Section
  const renderHistory = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Lịch sử đặt phòng</h5>
      </div>
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="light" />
        </div>
      ) : bookingHistory.length > 0 ? (
        <div className="table-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Phòng trọ</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
                <th>Số tiền</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {bookingHistory.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.accommodation?.title || 'N/A'}</td>
                  <td>{new Date(booking.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>{getStatusBadge(booking.status)}</td>
                  <td>{booking.amount?.toLocaleString('vi-VN')} đ</td>
                  <td>
                    <AnimatedButton variant="ghost" size="sm">
                      <FaEye />
                    </AnimatedButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
          Bạn chưa có lịch sử đặt phòng nào.
        </Alert>
      )}
    </div>
  );

  // Messages Section
  const renderMessages = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Tin nhắn</h5>
      </div>
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="light" />
        </div>
      ) : conversations.length > 0 ? (
        <div className="conversation-list">
          {conversations.map(conversation => (
            <div key={conversation.id} className="conversation-item p-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1" style={{ color: 'var(--text-primary)' }}>
                    {conversation.participant?.username || 'N/A'}
                  </h6>
                  <p className="mb-0" style={{ color: 'var(--text-muted)' }}>
                    {conversation.lastMessage}
                  </p>
                </div>
                <div className="text-end">
                  <small style={{ color: 'var(--text-muted)' }}>
                    {new Date(conversation.updatedAt).toLocaleDateString('vi-VN')}
                  </small>
                  <br />
                  <AnimatedButton variant="ghost" size="sm" icon={<FaEnvelope />}>
                    Nhắn tin
                  </AnimatedButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
          Bạn chưa có tin nhắn nào.
        </Alert>
      )}
    </div>
  );

  // Notifications Section
  const renderNotifications = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Thông báo</h5>
      </div>
      <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
        Tính năng thông báo đang được phát triển.
      </Alert>
    </div>
  );

  // Chatbot Section
  const renderChatbot = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Chatbot AI</h5>
      </div>
      <Chat />
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'search': return renderSearch();
      case 'favorites': return renderFavorites();
      case 'contracts': return renderContracts();
      case 'payments': return renderPayments();
      case 'history': return renderHistory();
      case 'messages': return renderMessages();
      case 'notification': return renderNotifications();
      case 'chatbot': return renderChatbot();
      default: return renderDashboard();
    }
  };

  return (
    <DashboardLayout
      title="Tenant"
      sidebarItems={SIDEBAR_ITEMS}
      activeKey={activeTab}
      onNavigate={setActiveTab}
      userInfo={userInfo}
    >
      {error && (
        <Alert
          variant="danger"
          onClose={() => setError('')}
          dismissible
          className="mb-4"
        >
          {error}
        </Alert>
      )}

      {renderContent()}
    </DashboardLayout>
  );
};

export default TenantDashboard;