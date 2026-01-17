/**
 * AdminDashboard
 * 
 * Premium admin dashboard with cosmic sparkle theme.
 * Features: User management, ads, news, reports, roles, and system status.
 * Follows Single Responsibility Principle - composed of smaller components.
 * 
 * @component
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import {
  FaBullhorn, FaNewspaper, FaUsers, FaMoneyBillWave, FaPlus, FaChartLine,
  FaShieldAlt, FaHome, FaFileAlt, FaQuestionCircle, FaWallet, FaRobot,
  FaBook, FaCodeBranch, FaBell, FaUserShield, FaHistory, FaUserCog,
  FaFileContract, FaTools, FaSignInAlt, FaUserPlus, FaUserLock, FaKey,
  FaServer, FaDatabase, FaCloud
} from 'react-icons/fa';

// UI Components
import { DashboardLayout, StatCard, AnimatedButton } from '../components/ui';

// Services
import advertisementService from '../services/advertisementService';
import adminService from '../services/adminService';

// Components
import RoleManagement from '../components/RoleManagement';
import UserPreferences from '../components/UserPreferences';
import ActivityLogs from '../components/ActivityLogs';
import RentalContractManagement from '../components/RentalContractManagement';
import AmenityManagement from '../components/AmenityManagement';
import PriceHistoryManagement from '../components/PriceHistoryManagement';
import NewsManagement from '../components/NewsManagement';
import StaticPagesManagement from '../components/StaticPagesManagement';
import FAQManagement from '../components/FAQManagement';
import RevenueManagement from '../components/RevenueManagement';
import APIDocumentation from '../components/APIDocumentation';
import GraphQLPlayground from '../components/GraphQLPlayground';
import NotificationManagement from '../components/NotificationManagement';
import ChatbotAIManagement from '../components/ChatbotAIManagement';
import ReportManagementPage from './ReportManagementPage';

// Sidebar menu items
const SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Tổng quan', icon: <FaHome /> },
  { key: 'users', label: 'Người dùng', icon: <FaUsers /> },
  { key: 'roles', label: 'Vai trò & Quyền', icon: <FaUserShield /> },
  { key: 'preferences', label: 'Tùy chọn', icon: <FaUserCog /> },
  { key: 'activities', label: 'Hoạt động', icon: <FaHistory /> },
  { key: 'contracts', label: 'Hợp đồng', icon: <FaFileContract /> },
  { key: 'amenities', label: 'Tiện ích', icon: <FaTools /> },
  { key: 'pricehistory', label: 'Lịch sử giá', icon: <FaChartLine /> },
  { key: 'ads', label: 'Quảng cáo', icon: <FaBullhorn /> },
  { key: 'news', label: 'Tin tức', icon: <FaNewspaper /> },
  { key: 'reports', label: 'Báo cáo', icon: <FaShieldAlt /> },
  { key: 'static', label: 'Trang tĩnh', icon: <FaFileAlt /> },
  { key: 'faq', label: 'FAQ', icon: <FaQuestionCircle /> },
  { key: 'revenue', label: 'Doanh thu', icon: <FaWallet /> },
  { key: 'apidocs', label: 'API Docs', icon: <FaBook /> },
  { key: 'graphql', label: 'GraphQL', icon: <FaCodeBranch /> },
  { key: 'notification', label: 'Thông báo', icon: <FaBell /> },
  { key: 'chatbot', label: 'Chatbot AI', icon: <FaRobot /> },
];

// System services status
const SYSTEM_STATUS = [
  { service: 'Database', status: 'online', uptime: '99.9%', icon: <FaDatabase /> },
  { service: 'API Server', status: 'online', uptime: '99.8%', icon: <FaServer /> },
  { service: 'File Storage', status: 'online', uptime: '99.7%', icon: <FaCloud /> },
  { service: 'Email Service', status: 'online', uptime: '99.5%', icon: <FaBell /> },
];

const AdminDashboard = () => {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');

  // Dashboard stats
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);

  // Users management
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userSearchDebounced, setUserSearchDebounced] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [userTotal, setUserTotal] = useState(0);
  const [userAction, setUserAction] = useState(null);
  const [showUserConfirm, setShowUserConfirm] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [userActionError, setUserActionError] = useState('');

  // Ads management
  const [ads, setAds] = useState([]);
  const [adSearch, setAdSearch] = useState('');
  const [adStatus, setAdStatus] = useState('');
  const [adPage, setAdPage] = useState(1);
  const [adPageSize, setAdPageSize] = useState(10);
  const [adTotal, setAdTotal] = useState(0);
  const [adAction, setAdAction] = useState(null);
  const [showAdConfirm, setShowAdConfirm] = useState(false);
  const [adActionLoading, setAdActionLoading] = useState(false);
  const [adActionError, setAdActionError] = useState('');

  // Loading states
  const [loading, setLoading] = useState({
    stats: true,
    activities: true,
    users: true,
    ads: true,
  });

  // User info
  const userInfo = {
    name: 'Admin',
    role: 'Administrator',
    avatar: null,
  };

  // Activity icon helper
  const getActivityIcon = (action) => {
    const icons = {
      login: <FaSignInAlt className="text-success" />,
      register: <FaUserPlus className="text-info" />,
      'update-profile': <FaUserCog className="text-primary" />,
      'change-password': <FaKey className="text-warning" />,
      'lock-account': <FaUserLock className="text-danger" />,
      'create-accommodation': <FaPlus className="text-success" />,
      'update-advertisement': <FaBullhorn className="text-primary" />,
    };
    return icons[action] || <FaHistory className="text-secondary" />;
  };

  // Fetch dashboard stats
  const fetchDashboardData = useCallback(async () => {
    setLoading(prev => ({ ...prev, stats: true }));
    try {
      const statsData = await adminService.getOverviewStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }

    setLoading(prev => ({ ...prev, activities: true }));
    try {
      const activitiesData = await adminService.getRecentActivities();
      setRecentActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(prev => ({ ...prev, activities: false }));
    }
  }, []);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (activeTab !== 'users') return;
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const res = await adminService.getUsers({
        page: userPage,
        limit: userPageSize,
        search: userSearchDebounced,
        role: userRole,
        status: userStatus
      });
      setUsers(res.users);
      setUserTotal(res.total || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, [activeTab, userPage, userPageSize, userSearchDebounced, userRole, userStatus]);

  // Fetch ads
  const fetchAds = useCallback(async () => {
    if (activeTab !== 'ads') return;
    setLoading(prev => ({ ...prev, ads: true }));
    try {
      const res = await advertisementService.getAdvertisements({
        page: adPage,
        limit: adPageSize,
        search: adSearch,
        status: adStatus
      });
      setAds(res.advertisements);
      setAdTotal(res.total);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(prev => ({ ...prev, ads: false }));
    }
  }, [activeTab, adPage, adPageSize, adSearch, adStatus]);

  // Initial load
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Load data based on tab
  useEffect(() => {
    fetchUsers();
    fetchAds();
  }, [fetchUsers, fetchAds]);

  // Debounce user search
  useEffect(() => {
    const timer = setTimeout(() => {
      setUserSearchDebounced(userSearch);
      setUserPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // User actions
  const handleUserAction = (type, user) => {
    setUserAction({ type, user });
    setShowUserConfirm(true);
  };

  const confirmUserAction = async () => {
    if (!userAction) return;
    const { type, user } = userAction;

    try {
      setUserActionLoading(true);
      setUserActionError('');
      switch (type) {
        case 'delete':
          await adminService.deleteUser(user.id);
          break;
        case 'lock':
          await adminService.lockUser(user.id, true);
          break;
        case 'unlock':
          await adminService.lockUser(user.id, false);
          break;
        default:
          throw new Error('Invalid action');
      }
      setShowUserConfirm(false);
      setUserPage(1);
      fetchUsers();
    } catch (error) {
      setUserActionError(error.message || 'Action failed');
    } finally {
      setUserActionLoading(false);
    }
  };

  // Ad actions
  const confirmAdAction = async () => {
    if (!adAction) return;
    setAdActionLoading(true);
    setAdActionError('');
    try {
      if (adAction.type === 'delete') {
        await advertisementService.deleteAdvertisement(adAction.ad.id);
      } else if (adAction.type === 'approve') {
        await advertisementService.approveAdvertisement(adAction.ad.id, 'active');
      } else if (adAction.type === 'reject') {
        await advertisementService.approveAdvertisement(adAction.ad.id, 'rejected');
      }
      setShowAdConfirm(false);
      fetchAds();
    } catch (err) {
      setAdActionError('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setAdActionLoading(false);
    }
  };

  // ========================== RENDER SECTIONS ==========================

  // Dashboard Overview
  const renderDashboard = () => (
    <>
      {/* Stats Grid */}
      <div className="grid-stats mb-4">
        <StatCard
          title="Quảng cáo"
          value={stats?.advertisements?.count || 0}
          icon={<FaBullhorn />}
          color="primary"
          loading={loading.stats}
          trend={stats?.advertisements?.change ? { value: Math.abs(stats.advertisements.change), direction: stats.advertisements.change > 0 ? 'up' : 'down' } : null}
        />
        <StatCard
          title="Tin tức"
          value={stats?.news?.count || 0}
          icon={<FaNewspaper />}
          color="success"
          loading={loading.stats}
        />
        <StatCard
          title="Người dùng"
          value={stats?.users?.count || 0}
          icon={<FaUsers />}
          color="info"
          loading={loading.stats}
        />
        <StatCard
          title="Doanh thu"
          value={stats?.revenue?.count || 0}
          prefix=""
          suffix=" đ"
          icon={<FaMoneyBillWave />}
          color="warning"
          loading={loading.stats}
        />
      </div>

      {/* Quick Actions */}
      <div className="card-glass mb-4">
        <div className="card-glass__header">
          <h5 className="card-glass__title">Thao tác nhanh</h5>
        </div>
        <div className="d-flex flex-wrap gap-3">
          <AnimatedButton variant="primary" icon={<FaPlus />} onClick={() => setActiveTab('ads')}>
            Tạo quảng cáo
          </AnimatedButton>
          <AnimatedButton variant="secondary" icon={<FaNewspaper />} onClick={() => setActiveTab('news')}>
            Thêm tin tức
          </AnimatedButton>
          <AnimatedButton variant="secondary" icon={<FaUsers />} onClick={() => setActiveTab('users')}>
            Quản lý người dùng
          </AnimatedButton>
          <AnimatedButton variant="secondary" icon={<FaChartLine />} onClick={() => setActiveTab('reports')}>
            Xem báo cáo
          </AnimatedButton>
        </div>
      </div>

      <Row>
        {/* System Status */}
        <Col lg={6} className="mb-4">
          <div className="card-glass">
            <div className="card-glass__header">
              <h5 className="card-glass__title">Trạng thái hệ thống</h5>
            </div>
            <div className="table-wrapper">
              <table className="table-modern">
                <tbody>
                  {SYSTEM_STATUS.map((service, index) => (
                    <tr key={index}>
                      <td>
                        <span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>
                          {service.icon}
                        </span>
                        {service.service}
                      </td>
                      <td>
                        <span className={`badge-cosmic badge-cosmic--${service.status === 'online' ? 'success' : 'danger'}`}>
                          {service.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>{service.uptime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Col>

        {/* Recent Activities */}
        <Col lg={6} className="mb-4">
          <div className="card-glass">
            <div className="card-glass__header">
              <h5 className="card-glass__title">Hoạt động gần đây</h5>
            </div>
            {loading.activities ? (
              <div className="text-center py-4">
                <Spinner animation="border" variant="light" />
              </div>
            ) : recentActivities.length > 0 ? (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {recentActivities.map(activity => (
                  <div key={activity.id} className="d-flex align-items-center p-3" style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ marginRight: '12px' }}>
                      {getActivityIcon(activity.action)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, color: 'var(--text-primary)' }}>
                        <strong>{activity.user?.username || 'Hệ thống'}</strong> {activity.details}
                      </p>
                      <small style={{ color: 'var(--text-muted)' }}>
                        {new Date(activity.createdAt).toLocaleString('vi-VN')}
                      </small>
                    </div>
                    <span className="badge-cosmic badge-cosmic--info">{activity.targetType}</span>
                  </div>
                ))}
              </div>
            ) : (
              <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
                Chưa có hoạt động nào.
              </Alert>
            )}
          </div>
        </Col>
      </Row>
    </>
  );

  // Users Management
  const renderUsers = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Quản lý người dùng</h5>
      </div>

      {/* Filters */}
      <Row className="mb-3">
        <Col md={4} className="mb-2">
          <Form.Control
            placeholder="Tìm theo tên, email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="bg-dark text-light border-secondary"
          />
        </Col>
        <Col md={3} className="mb-2">
          <Form.Select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            className="bg-dark text-light border-secondary"
          >
            <option value="">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="landlord">Chủ nhà</option>
            <option value="tenant">Người thuê</option>
            <option value="moderator">Kiểm duyệt</option>
          </Form.Select>
        </Col>
        <Col md={3} className="mb-2">
          <Form.Select
            value={userStatus}
            onChange={(e) => setUserStatus(e.target.value)}
            className="bg-dark text-light border-secondary"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Active</option>
            <option value="locked">Locked</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Table */}
      {loading.users ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="light" />
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td><span className="badge-cosmic badge-cosmic--primary">{user.role}</span></td>
                    <td>
                      {user.isLocked ? (
                        <span className="badge-cosmic badge-cosmic--danger">Locked</span>
                      ) : (
                        <span className="badge-cosmic badge-cosmic--success">Active</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <AnimatedButton
                          variant="danger"
                          size="sm"
                          onClick={() => handleUserAction('delete', user)}
                        >
                          Xóa
                        </AnimatedButton>
                        {user.isLocked ? (
                          <AnimatedButton
                            variant="success"
                            size="sm"
                            onClick={() => handleUserAction('unlock', user)}
                          >
                            Mở khóa
                          </AnimatedButton>
                        ) : (
                          <AnimatedButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUserAction('lock', user)}
                          >
                            Khóa
                          </AnimatedButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span style={{ color: 'var(--text-secondary)' }}>Tổng số: {userTotal}</span>
            <div className="d-flex align-items-center gap-2">
              <Form.Select
                size="sm"
                value={userPageSize}
                onChange={(e) => setUserPageSize(Number(e.target.value))}
                style={{ width: 'auto' }}
                className="bg-dark text-light border-secondary"
              >
                <option value="10">10 / trang</option>
                <option value="20">20 / trang</option>
                <option value="50">50 / trang</option>
              </Form.Select>
              <AnimatedButton
                variant="secondary"
                size="sm"
                onClick={() => setUserPage(p => p - 1)}
                disabled={userPage === 1}
              >
                Trước
              </AnimatedButton>
              <span style={{ color: 'var(--text-primary)' }}>
                {userPage} / {Math.ceil(userTotal / userPageSize) || 1}
              </span>
              <AnimatedButton
                variant="secondary"
                size="sm"
                onClick={() => setUserPage(p => p + 1)}
                disabled={userPage >= Math.ceil(userTotal / userPageSize)}
              >
                Sau
              </AnimatedButton>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Ads Management
  const renderAds = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Quản lý quảng cáo</h5>
        <AnimatedButton variant="primary" size="sm" icon={<FaPlus />}>
          Thêm quảng cáo
        </AnimatedButton>
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-3">
        <Form.Control
          size="sm"
          placeholder="Tìm kiếm tiêu đề..."
          value={adSearch}
          onChange={e => { setAdSearch(e.target.value); setAdPage(1); }}
          style={{ maxWidth: 200 }}
          className="bg-dark text-light border-secondary"
        />
        <Form.Select
          size="sm"
          value={adStatus}
          onChange={e => { setAdStatus(e.target.value); setAdPage(1); }}
          style={{ maxWidth: 140 }}
          className="bg-dark text-light border-secondary"
        >
          <option value="">Tất cả</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="rejected">Rejected</option>
        </Form.Select>
      </div>

      {loading.ads ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="light" />
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tiêu đề</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad, idx) => (
                  <tr key={ad.id}>
                    <td>{(adPage - 1) * adPageSize + idx + 1}</td>
                    <td>{ad.title}</td>
                    <td>{ad.description}</td>
                    <td>
                      <span className={`badge-cosmic badge-cosmic--${ad.status === 'active' ? 'success' : ad.status === 'pending' ? 'warning' : 'danger'}`}>
                        {ad.status || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <AnimatedButton variant="ghost" size="sm">Sửa</AnimatedButton>
                        <AnimatedButton
                          variant="danger"
                          size="sm"
                          onClick={() => { setAdAction({ type: 'delete', ad }); setShowAdConfirm(true); }}
                        >
                          Xóa
                        </AnimatedButton>
                        {ad.status !== 'active' && (
                          <AnimatedButton
                            variant="success"
                            size="sm"
                            onClick={() => { setAdAction({ type: 'approve', ad }); setShowAdConfirm(true); }}
                          >
                            Duyệt
                          </AnimatedButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <Form.Select
              size="sm"
              value={adPageSize}
              onChange={e => { setAdPageSize(Number(e.target.value)); setAdPage(1); }}
              style={{ width: 'auto' }}
              className="bg-dark text-light border-secondary"
            >
              {[10, 20, 50].map(size => <option key={size} value={size}>{size}/trang</option>)}
            </Form.Select>
            <div className="d-flex align-items-center gap-2">
              <AnimatedButton
                variant="secondary"
                size="sm"
                disabled={adPage === 1}
                onClick={() => setAdPage(p => p - 1)}
              >
                Trước
              </AnimatedButton>
              <span style={{ color: 'var(--text-primary)' }}>
                {adPage} / {Math.ceil(adTotal / adPageSize) || 1}
              </span>
              <AnimatedButton
                variant="secondary"
                size="sm"
                disabled={adPage >= Math.ceil(adTotal / adPageSize)}
                onClick={() => setAdPage(p => p + 1)}
              >
                Sau
              </AnimatedButton>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'users': return renderUsers();
      case 'roles': return <RoleManagement isActive={activeTab === 'roles'} />;
      case 'preferences': return <UserPreferences isActive={activeTab === 'preferences'} userId={null} isAdmin={true} />;
      case 'activities': return <ActivityLogs isActive={activeTab === 'activities'} />;
      case 'contracts': return <RentalContractManagement isActive={activeTab === 'contracts'} />;
      case 'amenities': return <AmenityManagement isActive={activeTab === 'amenities'} />;
      case 'pricehistory': return <PriceHistoryManagement isActive={activeTab === 'pricehistory'} />;
      case 'ads': return renderAds();
      case 'news': return <NewsManagement isActive={activeTab === 'news'} />;
      case 'reports': return <ReportManagementPage isActive={activeTab === 'reports'} />;
      case 'static': return <StaticPagesManagement isActive={activeTab === 'static'} />;
      case 'faq': return <FAQManagement isActive={activeTab === 'faq'} />;
      case 'revenue': return <RevenueManagement isActive={activeTab === 'revenue'} />;
      case 'apidocs': return <APIDocumentation isActive={activeTab === 'apidocs'} />;
      case 'graphql': return <GraphQLPlayground isActive={activeTab === 'graphql'} />;
      case 'notification': return <NotificationManagement isActive={activeTab === 'notification'} />;
      case 'chatbot': return <ChatbotAIManagement isActive={activeTab === 'chatbot'} />;
      default: return renderDashboard();
    }
  };

  return (
    <>
      <DashboardLayout
        title="Admin"
        sidebarItems={SIDEBAR_ITEMS}
        activeKey={activeTab}
        onNavigate={setActiveTab}
        userInfo={userInfo}
      >
        {renderContent()}
      </DashboardLayout>

      {/* User Action Confirmation Modal */}
      <Modal show={showUserConfirm} onHide={() => setShowUserConfirm(false)} centered>
        <Modal.Header closeButton className="bg-dark text-light border-secondary">
          <Modal.Title>Xác nhận hành động</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {userActionError && <Alert variant="danger">{userActionError}</Alert>}
          <p>Bạn có chắc muốn {userAction?.type === 'delete' ? 'xóa' : userAction?.type === 'lock' ? 'khóa' : 'mở khóa'} người dùng <strong>{userAction?.user?.username}</strong>?</p>
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <AnimatedButton variant="secondary" onClick={() => setShowUserConfirm(false)}>Hủy</AnimatedButton>
          <AnimatedButton variant="danger" onClick={confirmUserAction} loading={userActionLoading}>
            Xác nhận
          </AnimatedButton>
        </Modal.Footer>
      </Modal>

      {/* Ad Action Confirmation Modal */}
      <Modal show={showAdConfirm} onHide={() => setShowAdConfirm(false)} centered>
        <Modal.Header closeButton className="bg-dark text-light border-secondary">
          <Modal.Title>Xác nhận thao tác</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          {adAction && (
            <>
              {adAction.type === 'delete' && <p>Bạn có chắc chắn muốn <b>xóa</b> quảng cáo <b>{adAction.ad.title}</b>?</p>}
              {adAction.type === 'approve' && <p>Bạn có chắc chắn muốn <b>duyệt</b> quảng cáo <b>{adAction.ad.title}</b>?</p>}
              {adAction.type === 'reject' && <p>Bạn có chắc chắn muốn <b>ẩn</b> quảng cáo <b>{adAction.ad.title}</b>?</p>}
            </>
          )}
          {adActionError && <Alert variant="danger" className="mt-2">{adActionError}</Alert>}
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <AnimatedButton variant="secondary" onClick={() => setShowAdConfirm(false)}>Hủy</AnimatedButton>
          <AnimatedButton variant="primary" onClick={confirmAdAction} loading={adActionLoading}>
            {adAction?.type === 'delete' ? 'Xóa' : adAction?.type === 'approve' ? 'Duyệt' : 'Ẩn'}
          </AnimatedButton>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminDashboard;