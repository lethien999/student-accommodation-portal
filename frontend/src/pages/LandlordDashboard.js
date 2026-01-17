/**
 * LandlordDashboard
 * 
 * Premium dashboard for landlords with cosmic sparkle theme.
 * Features: Multi-property management, statistics, contracts, tenants, revenue.
 * Follows Single Responsibility Principle - composed of smaller components.
 * 
 * @component
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Alert, Table, Badge, Row, Col, Spinner, Form } from 'react-bootstrap';
import {
  FaHome, FaFileContract, FaMoneyBillWave, FaUsers, FaChartLine,
  FaBell, FaRobot, FaPlus, FaEye, FaTools, FaBuilding, FaExclamationTriangle
} from 'react-icons/fa';

// UI Components
import { DashboardLayout, StatCard, AnimatedButton } from '../components/ui';

// Services
import accommodationService from '../services/accommodationService';
import rentalContractService from '../services/rentalContractService';
import userService from '../services/userService';
import paymentService from '../services/paymentService';

// Components
import AccommodationForm from './AccommodationForm';
import AccommodationCard from '../components/AccommodationCard';
import MaintenanceManagementPage from './MaintenanceManagementPage';

// Sidebar menu items
const SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Tổng quan', icon: <FaHome /> },
  { key: 'properties', label: 'Nhà trọ', icon: <FaBuilding /> },
  { key: 'accommodations', label: 'Phòng trọ', icon: <FaHome /> },
  { key: 'contracts', label: 'Hợp đồng', icon: <FaFileContract /> },
  { key: 'tenants', label: 'Người thuê', icon: <FaUsers /> },
  { key: 'maintenance', label: 'Bảo trì', icon: <FaTools /> },
  { key: 'revenue', label: 'Doanh thu', icon: <FaMoneyBillWave /> },
  { key: 'reports', label: 'Báo cáo', icon: <FaChartLine /> },
  { key: 'notification', label: 'Thông báo', icon: <FaBell /> },
  { key: 'chatbot', label: 'Chatbot AI', icon: <FaRobot /> },
];

const LandlordDashboard = () => {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddAccommodation, setShowAddAccommodation] = useState(false);

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dashboard statistics
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalRooms: 0,
    occupiedRooms: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    totalTenants: 0,
    expiringContracts: 0,
  });

  // Data lists
  const [accommodations, setAccommodations] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [revenue, setRevenue] = useState([]);

  // User info (would come from auth context in production)
  const userInfo = {
    name: 'Chủ trọ',
    role: 'Landlord',
    avatar: null,
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await accommodationService.getLandlordDashboardStats();
      setStats(prev => ({
        ...prev,
        totalRooms: data.accommodations?.count || 0,
        monthlyRevenue: data.revenue || 0,
        totalTenants: data.tenants?.count || 0,
      }));
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Không thể tải thống kê. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch accommodations
  const fetchAccommodations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await accommodationService.getLandlordAccommodations();
      setAccommodations(data);
    } catch (err) {
      console.error('Error fetching accommodations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch contracts
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await rentalContractService.getLandlordContracts();
      setContracts(data);
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tenants
  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getLandlordTenants();
      setTenants(data);
    } catch (err) {
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch revenue
  const fetchRevenue = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentService.getLandlordRevenue();
      setRevenue(data);
    } catch (err) {
      console.error('Error fetching revenue:', err);
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
      case 'accommodations':
      case 'properties':
        fetchAccommodations();
        break;
      case 'contracts':
        fetchContracts();
        break;
      case 'tenants':
        fetchTenants();
        break;
      case 'revenue':
        fetchRevenue();
        break;
      default:
        break;
    }
  }, [activeTab, fetchDashboardStats, fetchAccommodations, fetchContracts, fetchTenants, fetchRevenue]);

  // Handle accommodation creation success
  const handleAccommodationSuccess = () => {
    setShowAddAccommodation(false);
    if (activeTab === 'accommodations' || activeTab === 'properties') {
      fetchAccommodations();
    }
  };

  // Header actions
  const HeaderActions = () => (
    <div className="d-flex align-items-center gap-2">
      <AnimatedButton
        variant="primary"
        size="sm"
        icon={<FaPlus />}
        onClick={() => setShowAddAccommodation(true)}
      >
        Thêm phòng
      </AnimatedButton>
    </div>
  );

  // Status badge helper
  const getStatusBadge = (status) => {
    const variants = {
      active: { bg: 'success', label: 'Đang thuê' },
      pending: { bg: 'warning', label: 'Chờ duyệt' },
      expired: { bg: 'danger', label: 'Hết hạn' },
      completed: { bg: 'success', label: 'Đã thanh toán' },
      cancelled: { bg: 'secondary', label: 'Đã hủy' },
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
              title="Tổng phòng trọ"
              value={stats.totalRooms}
              icon={<FaHome />}
              color="primary"
              trend={{ value: 5, direction: 'up' }}
            />
            <StatCard
              title="Doanh thu tháng"
              value={stats.monthlyRevenue}
              prefix=""
              suffix=" đ"
              icon={<FaMoneyBillWave />}
              color="success"
            />
            <StatCard
              title="Người thuê"
              value={stats.totalTenants}
              icon={<FaUsers />}
              color="info"
            />
            <StatCard
              title="Thanh toán chờ"
              value={stats.pendingPayments}
              icon={<FaExclamationTriangle />}
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
                icon={<FaPlus />}
                onClick={() => setShowAddAccommodation(true)}
              >
                Thêm phòng mới
              </AnimatedButton>
              <AnimatedButton
                variant="secondary"
                icon={<FaFileContract />}
                onClick={() => setActiveTab('contracts')}
              >
                Xem hợp đồng
              </AnimatedButton>
              <AnimatedButton
                variant="secondary"
                icon={<FaMoneyBillWave />}
                onClick={() => setActiveTab('revenue')}
              >
                Xem doanh thu
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

  // Properties Section
  const renderProperties = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Quản lý nhà trọ</h5>
        <AnimatedButton variant="primary" size="sm" icon={<FaPlus />}>
          Thêm nhà trọ
        </AnimatedButton>
      </div>
      <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
        Tính năng quản lý nhiều nhà trọ sẽ được cập nhật sớm.
      </Alert>
    </div>
  );

  // Accommodations Section
  const renderAccommodations = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Danh sách phòng trọ</h5>
        <AnimatedButton
          variant="primary"
          size="sm"
          icon={<FaPlus />}
          onClick={() => setShowAddAccommodation(true)}
        >
          Thêm phòng
        </AnimatedButton>
      </div>
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="light" />
        </div>
      ) : accommodations.length > 0 ? (
        <Row>
          {accommodations.map(acc => (
            <Col key={acc.id} lg={4} md={6} className="mb-4">
              <AccommodationCard
                accommodation={acc}
                isFavorite={false}
                onFavoriteToggle={() => { }}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
          Bạn chưa có phòng trọ nào. Hãy thêm phòng đầu tiên!
        </Alert>
      )}
    </div>
  );

  // Contracts Section
  const renderContracts = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Quản lý hợp đồng</h5>
      </div>
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="light" />
        </div>
      ) : contracts.length > 0 ? (
        <div className="table-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Người thuê</th>
                <th>Phòng</th>
                <th>Bắt đầu</th>
                <th>Kết thúc</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map(contract => (
                <tr key={contract.id}>
                  <td>{contract.contractNumber}</td>
                  <td>{contract.tenant?.username || 'N/A'}</td>
                  <td>{contract.accommodation?.title || 'N/A'}</td>
                  <td>{new Date(contract.startDate).toLocaleDateString('vi-VN')}</td>
                  <td>{new Date(contract.endDate).toLocaleDateString('vi-VN')}</td>
                  <td>{getStatusBadge(contract.status)}</td>
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
          Chưa có hợp đồng nào.
        </Alert>
      )}
    </div>
  );

  // Tenants Section
  const renderTenants = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Danh sách người thuê</h5>
      </div>
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="light" />
        </div>
      ) : tenants.length > 0 ? (
        <div className="table-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map(tenant => (
                <tr key={tenant.id}>
                  <td>{tenant.id}</td>
                  <td>{tenant.fullName || 'N/A'}</td>
                  <td>{tenant.email}</td>
                  <td>{tenant.phoneNumber || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
          Chưa có người thuê nào.
        </Alert>
      )}
    </div>
  );

  // Revenue Section
  const renderRevenue = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Tổng quan doanh thu</h5>
      </div>
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="light" />
        </div>
      ) : revenue.length > 0 ? (
        <div className="table-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <th>Số tiền</th>
                <th>Phương thức</th>
                <th>Trạng thái</th>
                <th>Ngày</th>
              </tr>
            </thead>
            <tbody>
              {revenue.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.id}</td>
                  <td>{payment.amount?.toLocaleString('vi-VN')} đ</td>
                  <td>{payment.paymentMethod}</td>
                  <td>{getStatusBadge(payment.status)}</td>
                  <td>{new Date(payment.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
          Chưa có dữ liệu doanh thu.
        </Alert>
      )}
    </div>
  );

  // Reports Section (Placeholder)
  const renderReports = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Báo cáo</h5>
      </div>
      <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
        Tính năng báo cáo đang được phát triển.
      </Alert>
    </div>
  );

  // Notifications Section (Placeholder)
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

  // Chatbot Section (Placeholder)
  const renderChatbot = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Chatbot AI</h5>
      </div>
      <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
        Tính năng chatbot đang được phát triển.
      </Alert>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'properties': return renderProperties();
      case 'accommodations': return renderAccommodations();
      case 'contracts': return renderContracts();
      case 'tenants': return renderTenants();
      case 'maintenance': return <MaintenanceManagementPage />;
      case 'revenue': return renderRevenue();
      case 'reports': return renderReports();
      case 'notification': return renderNotifications();
      case 'chatbot': return renderChatbot();
      default: return renderDashboard();
    }
  };

  return (
    <>
      <DashboardLayout
        title="Landlord"
        sidebarItems={SIDEBAR_ITEMS}
        activeKey={activeTab}
        onNavigate={setActiveTab}
        userInfo={userInfo}
        headerActions={<HeaderActions />}
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

      {/* Add Accommodation Modal */}
      <Modal
        show={showAddAccommodation}
        onHide={() => setShowAddAccommodation(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-dark text-light border-secondary">
          <Modal.Title>Thêm phòng trọ mới</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark">
          <AccommodationForm
            onSuccess={handleAccommodationSuccess}
            onCancel={() => setShowAddAccommodation(false)}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LandlordDashboard;