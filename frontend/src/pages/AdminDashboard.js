import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Table, Modal, Form, Alert, Spinner, Nav, ListGroup } from 'react-bootstrap';
import { FaBullhorn, FaNewspaper, FaUsers, FaMoneyBillWave, FaPlus, FaChartLine, FaShieldAlt, FaHome, FaFileAlt, FaQuestionCircle, FaWallet, FaRobot, FaBook, FaCodeBranch, FaBell, FaUserShield, FaHistory, FaUserCog, FaFileContract, FaTools, FaSignInAlt, FaUserPlus, FaUserLock, FaKey } from 'react-icons/fa';
import advertisementService from '../services/advertisementService';
import adminService from '../services/adminService';
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
import './AdminDashboard.css';

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

const AdminDashboard = () => {
  // State cho dữ liệu động
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState({
    stats: true,
    activities: true,
    users: true,
    ads: true,
  });

  // State cho tìm kiếm, lọc, phân trang user
  const [userSearch, setUserSearch] = useState('');
  const [userSearchDebounced, setUserSearchDebounced] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userStatus, setUserStatus] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(10);
  const [userTotal, setUserTotal] = useState(0);
  const [userAction, setUserAction] = useState(null); // {type, user}
  const [showUserConfirm, setShowUserConfirm] = useState(false);
  const [userActionLoading, setUserActionLoading] = useState(false);
  const [userActionError, setUserActionError] = useState('');

  // State cho tìm kiếm, lọc, phân trang quảng cáo
  const [adSearch, setAdSearch] = useState('');
  const [adStatus, setAdStatus] = useState('');
  const [adPage, setAdPage] = useState(1);
  const [adPageSize, setAdPageSize] = useState(10);
  const [adTotal, setAdTotal] = useState(0);
  const [adAction, setAdAction] = useState(null); // {type, ad}
  const [showAdConfirm, setShowAdConfirm] = useState(false);
  const [adActionLoading, setAdActionLoading] = useState(false);
  const [adActionError, setAdActionError] = useState('');

  const [sidebarTab, setSidebarTab] = useState('dashboard');

  const systemStatus = [
    { service: 'Database', status: 'online', uptime: '99.9%' },
    { service: 'API Server', status: 'online', uptime: '99.8%' },
    { service: 'File Storage', status: 'online', uptime: '99.7%' },
    { service: 'Email Service', status: 'online', uptime: '99.5%' }
  ];

  const quickActions = [
    {
      label: 'Tạo quảng cáo',
      icon: <FaPlus />,
      variant: 'primary',
      action: () => setSidebarTab('ads'),
    },
    {
      label: 'Thêm tin tức',
      icon: <FaNewspaper />,
      variant: 'outline-success',
      action: () => setSidebarTab('news'),
    },
    {
      label: 'Quản lý người dùng',
      icon: <FaUsers />,
      variant: 'outline-info',
      action: () => setSidebarTab('users'),
    },
    {
      label: 'Xem báo cáo',
      icon: <FaChartLine />,
      variant: 'outline-warning',
      action: () => setSidebarTab('reports'),
    }
  ];

  const getActivityIcon = (action) => {
    const icons = {
      login: <FaSignInAlt className="text-success" />,
      register: <FaUserPlus className="text-info" />,
      'update-profile': <FaUserCog className="text-primary" />,
      'change-password': <FaKey className="text-warning" />,
      'lock-account': <FaUserLock className="text-danger" />,
      'create-accommodation': <FaPlus className="text-success" />,
      'update-advertisement': <FaBullhorn className="text-primary" />,
      // Add more icons as needed
    };
    return icons[action] || <FaHistory className="text-secondary" />;
  };

  // 1. Thêm state để xác định thiết bị mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch stats
      setLoading(prev => ({...prev, stats: true}));
      try {
        const statsData = await adminService.getOverviewStats();
        const formattedStats = [
          { label: 'Quảng cáo', value: statsData.advertisements.count, icon: <FaBullhorn size={30} />, color: 'primary', change: `${statsData.advertisements.change > 0 ? '+' : ''}${statsData.advertisements.change}` },
          { label: 'Tin tức', value: statsData.news.count, icon: <FaNewspaper size={30} />, color: 'success', change: `${statsData.news.change > 0 ? '+' : ''}${statsData.news.change}` },
          { label: 'Người dùng', value: statsData.users.count, icon: <FaUsers size={30} />, color: 'info', change: `${statsData.users.change > 0 ? '+' : ''}${statsData.users.change}` },
          { label: 'Doanh thu', value: `${(statsData.revenue.count / 1000000).toFixed(1)}M`, icon: <FaMoneyBillWave size={30} />, color: 'warning', change: `${statsData.revenue.change}%` },
        ];
        setStats(formattedStats);
      } catch (error) {
        setStats([]);
      } finally {
        setLoading(prev => ({...prev, stats: false}));
      }

      // Fetch recent activities
      setLoading(prev => ({...prev, activities: true}));
      try {
        const activitiesData = await adminService.getRecentActivities();
        setRecentActivities(activitiesData);
      } catch (error) {
        setRecentActivities([]);
      } finally {
        setLoading(prev => ({...prev, activities: false}));
      }
    };
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchAds = async () => {
      if (sidebarTab !== 'ads') return;
      setLoading(l => ({...l, ads: true}));
      try {
        const res = await advertisementService.getAdvertisements({
          page: adPage,
          limit: adPageSize,
          search: adSearch,
          status: adStatus
        });
        setAds(res.advertisements);
        setAdTotal(res.total);
      } catch {
        setAds([]);
        setAdTotal(0);
      } finally {
        setLoading(l => ({...l, ads: false}));
      }
    };
    fetchAds();
  }, [adPage, adPageSize, adSearch, adStatus, sidebarTab]);

  // Fetch users with pagination and filters
  useEffect(() => {
    const fetchUsers = async () => {
      if (sidebarTab !== 'users') return;
      setLoading(l => ({...l, users: true}));
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
        setUserPage(res.page || userPage);
        setUserPageSize(res.pageSize || userPageSize);
      } catch {
        setUsers([]);
        setUserTotal(0);
      } finally {
        setLoading(l => ({...l, users: false}));
      }
    };
    fetchUsers();
  }, [userPage, userPageSize, userSearchDebounced, userRole, userStatus, sidebarTab]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setUserSearchDebounced(userSearch);
      setUserPage(1); // Reset về trang 1 khi search
    }, 500);

    return () => clearTimeout(timer);
  }, [userSearch]);

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
        // Add role change logic if needed
        default:
          throw new Error('Invalid action');
      }
      setShowUserConfirm(false);
      // Refresh user list
      setUserPage(1); 
    } catch (error) {
      setUserActionError(error.message || 'Action failed');
    } finally {
      setUserActionLoading(false);
    }
  };

  return (
    <div className="admin-layout d-flex">
      {/* Sidebar trái */}
      <div className="sidebar bg-light border-end d-flex flex-column p-0" style={{ minWidth: isMobile ? '100%' : 220, minHeight: isMobile ? 'auto' : '100vh', position: isMobile ? 'static' : 'sticky', top: 0 }}>
        <div className="sidebar-header text-center py-4 border-bottom">
          <h4 className="mb-0">Admin</h4>
          <small className="text-muted">Quản trị hệ thống</small>
        </div>
        {isMobile ? (
          <Nav className="flex-row justify-content-around mt-2" variant="pills" activeKey={sidebarTab}>
            {SIDEBAR_ITEMS.filter(item => ['dashboard','users','ads','news','reports'].includes(item.key)).map(item => (
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
            <h2 className="dashboard-title mb-1">Admin Dashboard</h2>
            <p className="dashboard-subtitle text-muted mb-0">Tổng quan hệ thống và các thao tác quản trị</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button variant="outline-secondary" size="sm" onClick={() => setSidebarTab('notification')}><FaBell /></Button>
            <Button variant="outline-primary" size="sm" onClick={() => setSidebarTab('chatbot')}><FaRobot /></Button>
            <Button variant="outline-dark" size="sm" onClick={() => setSidebarTab('apidocs')}><FaBook /></Button>
            <Button variant="outline-dark" size="sm" onClick={() => setSidebarTab('graphql')}><FaCodeBranch /></Button>
          </div>
        </div>
        {/* Nội dung dashboard sẽ render theo sidebarTab */}
        {sidebarTab === 'dashboard' && (
          <>
            {/* Widget thống kê, trạng thái hệ thống, hoạt động gần đây, v.v. */}
            {/* Stats Cards */}
            <Row>
              {loading.stats ? <Spinner animation="border" /> : (
                stats && stats.map((stat, index) => (
                  <Col xs={12} sm={6} md={6} xl={3} key={index} className="mb-4">
                    <Card className={`h-100 card-stat card-stat-${stat.color}`}>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <p className="stat-label text-muted mb-1">{stat.label}</p>
                            <h3 className="stat-value mb-1">{stat.value}</h3>
                            <div className="d-flex align-items-center">
                              <span className={`change-indicator ${stat.changeType}`}>
                                {stat.change}
                              </span>
                              <small className="text-muted ms-2">so với tuần trước</small>
                            </div>
                          </div>
                          <div className={`stat-icon ${stat.bgColor} text-white`}>
                            {stat.icon}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              )}
            </Row>
            {/* Quick Actions */}
            <Row className="mb-4">
              <Col>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Thao tác nhanh</h5>
                  </Card.Header>
                  <Card.Body>
                    {isMobile ? (
                      <div className="dropdown w-100 mb-2">
                        <Button className="w-100 dropdown-toggle" variant="primary" data-bs-toggle="dropdown">
                          Chọn thao tác
                        </Button>
                        <ul className="dropdown-menu w-100">
                          {quickActions.map((item, index) => (
                            <li key={index}>
                              <Button variant={item.variant} className="w-100 mb-1" onClick={item.action}>
                                {item.icon} {item.label}
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <Row>
                        {quickActions.map((item, index) => (
                          <Col key={index}>
                            <Button variant={item.variant} className="w-100" onClick={item.action}>
                              {item.icon} {item.label}
                            </Button>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            {/* System Status and Recent Activities */}
            <Row>
              <Col lg={6}>
                <Card className="mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Trạng thái hệ thống</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive size={isMobile ? 'sm' : undefined}>
                      <tbody>
                        {systemStatus.map((service, index) => (
                          <tr key={index}>
                            <td>{service.service}</td>
                            <td>
                              <Badge bg={service.status === 'online' ? 'success' : 'danger'}>
                                {service.status}
                              </Badge>
                            </td>
                            <td className="text-end">{service.uptime}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
              <Col lg={6}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">Hoạt động gần đây</h5>
                  </Card.Header>
                  <ListGroup variant="flush">
                    {loading.activities ? (
                      <div className="text-center p-3"><Spinner animation="border" size="sm" /></div>
                    ) : (
                      recentActivities.map((activity) => (
                        <ListGroup.Item key={activity.id} className={`d-flex align-items-center${isMobile ? ' flex-column text-center' : ''}`}>
                          <div className="activity-icon me-3 mb-2 mb-lg-0">
                            {getActivityIcon(activity.action)}
                          </div>
                          <div className="flex-grow-1">
                            <p className="mb-0">
                              <strong>{activity.user?.username || 'Hệ thống'}</strong> {activity.details}
                            </p>
                            <small className="text-muted">
                              {new Date(activity.createdAt).toLocaleString()}
                            </small>
                          </div>
                          <Badge bg="light" text="dark" className={isMobile ? 'mt-2' : 'ms-auto'}>{activity.targetType}</Badge>
                        </ListGroup.Item>
                      ))
                    )}
                  </ListGroup>
                </Card>
              </Col>
            </Row>
          </>
        )}
        {sidebarTab === 'users' && (
          <>
            {/* User Management Table */}
            <Card>
              <Card.Header>Quản lý người dùng</Card.Header>
              <Card.Body>
                {/* Search and filters UI */}
                <Row className="mb-3">
                  <Col md={4}>
                    <Form.Control
                      placeholder="Tìm theo tên, email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Select value={userRole} onChange={(e) => setUserRole(e.target.value)}>
                      <option value="">Tất cả vai trò</option>
                      <option value="admin">Admin</option>
                      <option value="landlord">Chủ nhà</option>
                      <option value="tenant">Người thuê</option>
                      <option value="moderator">Kiểm duyệt</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select value={userStatus} onChange={(e) => setUserStatus(e.target.value)}>
                      <option value="">Tất cả trạng thái</option>
                      <option value="active">Active</option>
                      <option value="locked">Locked</option>
                    </Form.Select>
                  </Col>
                </Row>
                <Table striped bordered hover responsive>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading.users ? (
                      <tr><td colSpan="6" className="text-center"><Spinner animation="border" /></td></tr>
                    ) : users.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td><Badge bg="primary">{user.role}</Badge></td>
                        <td>
                          {user.isLocked ? <Badge bg="danger">Locked</Badge> : <Badge bg="success">Active</Badge>}
                        </td>
                        <td>
                          <Button variant="outline-danger" size="sm" onClick={() => handleUserAction('delete', user)}>Xóa</Button>
                          {user.isLocked ? (
                            <Button variant="outline-success" size="sm" className="ms-2" onClick={() => handleUserAction('unlock', user)}>Mở khóa</Button>
                          ) : (
                            <Button variant="outline-warning" size="sm" className="ms-2" onClick={() => handleUserAction('lock', user)}>Khóa</Button>
                          )}
                           {/* Add role change button here */}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {/* Pagination UI */}
                <div className="d-flex justify-content-between align-items-center">
                  <span>Tổng số: {userTotal}</span>
                  <div>
                    <Form.Select size="sm" value={userPageSize} onChange={(e) => setUserPageSize(Number(e.target.value))} style={{display: 'inline-block', width: 'auto'}} className="me-2">
                      <option value="10">10 / trang</option>
                      <option value="20">20 / trang</option>
                      <option value="50">50 / trang</option>
                    </Form.Select>
                    <Button variant="secondary" size="sm" onClick={() => setUserPage(p => p - 1)} disabled={userPage === 1}>
                      Trước
                    </Button>
                    <span className="mx-2">
                      Trang {userPage} / {Math.ceil(userTotal / userPageSize) || 1}
                    </span>
                    <Button variant="secondary" size="sm" onClick={() => setUserPage(p => p + 1)} disabled={userPage >= Math.ceil(userTotal / userPageSize)}>
                      Sau
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </>
        )}
        {sidebarTab === 'roles' && (
          <RoleManagement isActive={sidebarTab === 'roles'} />
        )}
        {sidebarTab === 'preferences' && (
          <UserPreferences isActive={sidebarTab === 'preferences'} userId={null} isAdmin={true} />
        )}
        {sidebarTab === 'activities' && (
          <ActivityLogs isActive={sidebarTab === 'activities'} />
        )}
        {sidebarTab === 'contracts' && (
          <RentalContractManagement isActive={sidebarTab === 'contracts'} />
        )}
        {sidebarTab === 'amenities' && (
          <AmenityManagement isActive={sidebarTab === 'amenities'} />
        )}
        {sidebarTab === 'pricehistory' && (
          <PriceHistoryManagement isActive={sidebarTab === 'pricehistory'} />
        )}
        {sidebarTab === 'ads' && (
          <>
            {/* Bảng quảng cáo (hiển thị trực tiếp thay vì dưới dashboard) */}
            {/* ... chuyển phần bảng quảng cáo vào đây ... */}
            <div className="d-flex gap-2 mb-2">
              <Form.Control size="sm" placeholder="Tìm kiếm tiêu đề..." value={adSearch} onChange={e => {setAdSearch(e.target.value); setAdPage(1);}} style={{maxWidth:200}} />
              <Form.Select size="sm" value={adStatus} onChange={e => {setAdStatus(e.target.value); setAdPage(1);}} style={{maxWidth:140}}>
                <option value="">Tất cả trạng thái</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </div>
            {loading.ads ? <Spinner animation="border" size="sm" /> : (
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tiêu đề</th>
                      <th>Mô tả</th>
                      <th>Trạng thái</th>
                      <th>Link</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ads.map((ad, idx) => (
                      <tr key={ad.id}>
                        <td>{(adPage-1)*adPageSize + idx + 1}</td>
                        <td>{ad.title}</td>
                        <td>{ad.description}</td>
                        <td>{ad.status || 'Chưa rõ'}</td>
                        <td>{ad.targetUrl ? (<a href={ad.targetUrl} target="_blank" rel="noopener noreferrer">Truy cập</a>) : '—'}</td>
                        <td>
                          <Button size="sm" variant="outline-primary" className="me-1" onClick={() => {/* TODO: open edit modal */}}>Sửa</Button>
                          <Button size="sm" variant="outline-danger" className="me-1" onClick={() => {setAdAction({type:'delete', ad}); setShowAdConfirm(true);}}>Xóa</Button>
                          {ad.status !== 'active' && <Button size="sm" variant="outline-success" className="me-1" onClick={() => {setAdAction({type:'approve', ad}); setShowAdConfirm(true);}}>Duyệt</Button>}
                          {ad.status === 'active' && <Button size="sm" variant="outline-warning" onClick={() => {setAdAction({type:'reject', ad}); setShowAdConfirm(true);}}>Ẩn</Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {/* Phân trang quảng cáo */}
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <div>
                    <Form.Select size="sm" value={adPageSize} onChange={e => {setAdPageSize(Number(e.target.value)); setAdPage(1);}} style={{width: 'auto', display: 'inline-block'}}>
                      {[10, 20, 50].map(size => <option key={size} value={size}>{size}/trang</option>)}
                    </Form.Select>
                  </div>
                  <div>
                    <Button size="sm" disabled={adPage === 1} onClick={() => setAdPage(p => p-1)}>Trước</Button>
                    <span className="mx-2">Trang {adPage} / {Math.ceil(adTotal/adPageSize) || 1}</span>
                    <Button size="sm" disabled={adPage >= Math.ceil(adTotal/adPageSize)} onClick={() => setAdPage(p => p+1)}>Sau</Button>
                  </div>
                </div>
                {/* Modal xác nhận thao tác quảng cáo */}
                <Modal show={showAdConfirm} onHide={() => setShowAdConfirm(false)}>
                  <Modal.Header closeButton><Modal.Title>Xác nhận thao tác</Modal.Title></Modal.Header>
                  <Modal.Body>
                    {adAction && (
                      <>
                        {adAction.type === 'delete' && <p>Bạn có chắc chắn muốn <b>xóa</b> quảng cáo <b>{adAction.ad.title}</b>?</p>}
                        {adAction.type === 'approve' && <p>Bạn có chắc chắn muốn <b>duyệt</b> quảng cáo <b>{adAction.ad.title}</b>?</p>}
                        {adAction.type === 'reject' && <p>Bạn có chắc chắn muốn <b>ẩn</b> quảng cáo <b>{adAction.ad.title}</b>?</p>}
                      </>
                    )}
                    {adActionError && <Alert variant="danger" className="mt-2">{adActionError}</Alert>}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAdConfirm(false)}>Hủy</Button>
                    <Button variant="primary" disabled={adActionLoading} onClick={async () => {
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
                        // Reload lại danh sách quảng cáo
                        const res = await advertisementService.getAdvertisements({
                          page: adPage,
                          limit: adPageSize,
                          search: adSearch,
                          status: adStatus
                        });
                        setAds(res.advertisements);
                        setAdTotal(res.total);
                      } catch (err) {
                        setAdActionError('Có lỗi xảy ra, vui lòng thử lại!');
                      } finally {
                        setAdActionLoading(false);
                      }
                    }}>{adAction && (adAction.type === 'delete' ? 'Xóa' : adAction.type === 'approve' ? 'Duyệt' : 'Ẩn')}</Button>
                  </Modal.Footer>
                </Modal>
              </div>
            )}
          </>
        )}
        {sidebarTab === 'news' && (
          <NewsManagement isActive={sidebarTab === 'news'} />
        )}
        {sidebarTab === 'reports' && (
          <ReportManagementPage isActive={sidebarTab === 'reports'} />
        )}
        {sidebarTab === 'static' && (
          <StaticPagesManagement isActive={sidebarTab === 'static'} />
        )}
        {sidebarTab === 'faq' && (
          <FAQManagement isActive={sidebarTab === 'faq'} />
        )}
        {sidebarTab === 'revenue' && (
          <RevenueManagement isActive={sidebarTab === 'revenue'} />
        )}
        {sidebarTab === 'apidocs' && (
          <APIDocumentation isActive={sidebarTab === 'apidocs'} />
        )}
        {sidebarTab === 'graphql' && (
          <GraphQLPlayground isActive={sidebarTab === 'graphql'} />
        )}
        {sidebarTab === 'notification' && (
          <NotificationManagement isActive={sidebarTab === 'notification'} />
        )}
        {sidebarTab === 'chatbot' && (
          <ChatbotAIManagement isActive={sidebarTab === 'chatbot'} />
        )}
        {/* ... các tab khác tương tự ... */}
      </div>

      {/* User Action Confirmation Modal */}
      <Modal show={showUserConfirm} onHide={() => setShowUserConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận hành động</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userActionError && <Alert variant="danger">{userActionError}</Alert>}
          <p>Bạn có chắc muốn {userAction?.type} người dùng <strong>{userAction?.user?.username}</strong>?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUserConfirm(false)}>Hủy</Button>
          <Button variant="danger" onClick={confirmUserAction} disabled={userActionLoading}>
            {userActionLoading ? <Spinner as="span" animation="border" size="sm" /> : 'Xác nhận'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard; 