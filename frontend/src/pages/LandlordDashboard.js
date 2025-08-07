import React, { useState, useEffect } from 'react';
import { Button, Modal, Nav, Card, Row, Col, Spinner, Alert, Table, Badge } from 'react-bootstrap';
import { FaHome, FaFileContract, FaMoneyBillWave, FaUsers, FaChartLine, FaBell, FaRobot, FaPlus, FaEye, FaTools } from 'react-icons/fa';
import AccommodationForm from './AccommodationForm';
import accommodationService from '../services/accommodationService';
import rentalContractService from '../services/rentalContractService';
import userService from '../services/userService';
import paymentService from '../services/paymentService';
import AccommodationCard from '../components/AccommodationCard';
import MaintenanceManagementPage from './MaintenanceManagementPage';
import './LandlordDashboard.css';

const SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <FaHome /> },
  { key: 'accommodations', label: 'Accommodations', icon: <FaHome /> },
  { key: 'contracts', label: 'Contracts', icon: <FaFileContract /> },
  { key: 'tenants', label: 'Tenants', icon: <FaUsers /> },
  { key: 'maintenance', label: 'Maintenance', icon: <FaTools /> },
  { key: 'revenue', label: 'Revenue', icon: <FaMoneyBillWave /> },
  { key: 'reports', label: 'Reports', icon: <FaChartLine /> },
  { key: 'notification', label: 'Notifications', icon: <FaBell /> },
  { key: 'chatbot', label: 'Chatbot AI', icon: <FaRobot /> },
];

const LandlordDashboard = () => {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [showAddAccommodation, setShowAddAccommodation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dashboard stats
  const [stats, setStats] = useState({
    accommodations: { count: 0 },
    revenue: 0,
    tenants: { count: 0 }
  });
  
  // Accommodations
  const [accommodations, setAccommodations] = useState([]);
  
  // Contracts
  const [contracts, setContracts] = useState([]);
  
  // Tenants
  const [tenants, setTenants] = useState([]);
  
  // Revenue
  const [revenue, setRevenue] = useState([]);

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
        const data = await accommodationService.getLandlordDashboardStats();
        setStats(data);
      } catch (error) {
          console.error('Error fetching dashboard stats:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchDashboardStats();
  }, [sidebarTab]);

  // Load accommodations
  useEffect(() => {
    const fetchAccommodations = async () => {
      if (sidebarTab === 'accommodations') {
        try {
          setLoading(true);
          const data = await accommodationService.getLandlordAccommodations();
          setAccommodations(data);
        } catch (error) {
          console.error('Error fetching accommodations:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchAccommodations();
  }, [sidebarTab]);

  // Load contracts
  useEffect(() => {
    const fetchContracts = async () => {
      if (sidebarTab === 'contracts') {
        try {
          setLoading(true);
          const data = await rentalContractService.getLandlordContracts();
          setContracts(data);
        } catch (error) {
          console.error('Error fetching contracts:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchContracts();
  }, [sidebarTab]);

  // Load tenants
  useEffect(() => {
    const fetchTenants = async () => {
      if (sidebarTab === 'tenants') {
        try {
          setLoading(true);
          const data = await userService.getLandlordTenants();
          setTenants(data);
        } catch (error) {
          console.error('Error fetching tenants:', error);
      } finally {
          setLoading(false);
      }
      }
    };
    
    fetchTenants();
  }, [sidebarTab]);

  // Load revenue
  useEffect(() => {
    const fetchRevenue = async () => {
      if (sidebarTab === 'revenue') {
        try {
          setLoading(true);
          const data = await paymentService.getLandlordRevenue();
          setRevenue(data);
        } catch (error) {
          console.error('Error fetching revenue:', error);
        } finally {
          setLoading(false);
    }
      }
    };
    
    fetchRevenue();
  }, [sidebarTab]);

  const handleAccommodationSuccess = () => {
    setShowAddAccommodation(false);
    // Refresh accommodations list
    if (sidebarTab === 'accommodations') {
      const fetchAccommodations = async () => {
        try {
          const data = await accommodationService.getLandlordAccommodations();
          setAccommodations(data);
        } catch (error) {
          console.error('Error refreshing accommodations:', error);
        }
      };
      fetchAccommodations();
    }
  };

  return (
    <div className="landlord-layout d-flex">
      {/* Sidebar trái */}
      <div className="sidebar bg-light border-end d-flex flex-column p-0" style={{ minWidth: isMobile ? '100%' : 220, minHeight: isMobile ? 'auto' : '100vh', position: isMobile ? 'static' : 'sticky', top: 0 }}>
        <div className="sidebar-header text-center py-4 border-bottom">
          <h4 className="mb-0">Landlord</h4>
          <small className="text-muted">Dashboard</small>
        </div>
        {isMobile ? (
          <Nav className="flex-row justify-content-around mt-2" variant="pills" activeKey={sidebarTab}>
            {SIDEBAR_ITEMS.filter(item => ['dashboard','accommodations','contracts','tenants','revenue'].includes(item.key)).map(item => (
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
          <Button variant="outline-danger" size="sm" onClick={() => window.location.href = '/'}>Logout</Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-grow-1 p-4" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="dashboard-title mb-1">Landlord Dashboard</h2>
            <p className="dashboard-subtitle text-muted mb-0">Manage your accommodations, contracts, tenants, and revenue.</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Button variant="primary" onClick={() => setShowAddAccommodation(true)}><FaPlus className="me-2" /> New Listing</Button>
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
                      <FaHome size={40} className="text-primary mb-3" />
                      <Card.Title as="h3">{stats.accommodations.count}</Card.Title>
                      <Card.Text className="text-muted">Total Properties</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center p-3 shadow-sm">
                    <Card.Body>
                      <FaMoneyBillWave size={40} className="text-success mb-3" />
                      <Card.Title as="h3">{(stats.revenue || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</Card.Title>
                      <Card.Text className="text-muted">Monthly Revenue (est.)</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center p-3 shadow-sm">
                    <Card.Body>
                      <FaUsers size={40} className="text-info mb-3" />
                      <Card.Title as="h3">{stats.tenants.count}</Card.Title>
                      <Card.Text className="text-muted">Current Tenants</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </>
        )}

        {/* Accommodations Tab */}
        {sidebarTab === 'accommodations' && (
          <>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Manage Accommodations</h5>
                <Button variant="primary" size="sm" onClick={() => setShowAddAccommodation(true)}>
                  <FaPlus className="me-2" />Add New
                </Button>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center"><Spinner animation="border" /></div>
                ) : accommodations.length > 0 ? (
                  <Row>
                    {accommodations.map(acc => (
                      <Col key={acc.id} lg={4} md={6} className="mb-4">
                        <AccommodationCard 
                          accommodation={acc}
                          isFavorite={false}
                          onFavoriteToggle={() => {}}
                        />
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Alert variant="info">Bạn chưa có chỗ ở nào. Hãy thêm chỗ ở đầu tiên!</Alert>
                )}
              </Card.Body>
            </Card>
          </>
        )}

        {/* Contracts Tab */}
        {sidebarTab === 'contracts' && (
          <>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Manage Contracts</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center"><Spinner animation="border" /></div>
                ) : contracts.length > 0 ? (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Contract Number</th>
                        <th>Tenant</th>
                        <th>Accommodation</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contracts.map(contract => (
                        <tr key={contract.id}>
                          <td>{contract.contractNumber}</td>
                          <td>{contract.tenant?.username}</td>
                          <td>{contract.accommodation?.title}</td>
                          <td>{new Date(contract.startDate).toLocaleDateString()}</td>
                          <td>{new Date(contract.endDate).toLocaleDateString()}</td>
                          <td>
                            <Badge bg={contract.status === 'active' ? 'success' : 'secondary'}>
                              {contract.status}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="outline-primary" size="sm"><FaEye /></Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="info">No contracts found.</Alert>
                )}
              </Card.Body>
            </Card>
          </>
        )}

        {/* Tenants Tab */}
        {sidebarTab === 'tenants' && (
          <>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Manage Tenants</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center"><Spinner animation="border" /></div>
                ) : tenants.length > 0 ? (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
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
                  </Table>
                ) : (
                  <Alert variant="info">No tenants found.</Alert>
                )}
              </Card.Body>
            </Card>
          </>
        )}

        {/* Maintenance Tab */}
        {sidebarTab === 'maintenance' && <MaintenanceManagementPage />}

        {/* Revenue Tab */}
        {sidebarTab === 'revenue' && (
          <>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Revenue Overview</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center"><Spinner animation="border" /></div>
                ) : revenue.length > 0 ? (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenue.map(payment => (
                        <tr key={payment.id}>
                          <td>{payment.id}</td>
                          <td>{payment.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                          <td>{payment.paymentMethod}</td>
                          <td>
                            <Badge bg={payment.status === 'completed' ? 'success' : 'warning'}>
                              {payment.status}
                            </Badge>
                          </td>
                          <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="info">No revenue data available.</Alert>
                )}
              </Card.Body>
            </Card>
          </>
        )}

        {/* Reports Tab */}
        {sidebarTab === 'reports' && (
          <>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Báo cáo</h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="info">Chức năng báo cáo đang được phát triển.</Alert>
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
                <Alert variant="info">Chức năng chatbot đang được phát triển.</Alert>
              </Card.Body>
            </Card>
          </>
        )}

        {/* Modal thêm chỗ ở */}
        <Modal show={showAddAccommodation} onHide={() => setShowAddAccommodation(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Add New Accommodation</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AccommodationForm
              onSuccess={handleAccommodationSuccess}
              onCancel={() => setShowAddAccommodation(false)}
            />
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default LandlordDashboard; 