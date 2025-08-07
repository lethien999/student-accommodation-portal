import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Badge, Table, Alert, Spinner, Nav } from 'react-bootstrap';
import { FaShieldAlt, FaStar, FaBell, FaRobot, FaHome, FaExclamationTriangle, FaCheckCircle, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import reportService from '../services/reportService';
import reviewService from '../services/reviewService';
import './ModeratorDashboard.css';

const SIDEBAR_ITEMS = [
  { key: 'dashboard', label: 'Tổng quan', icon: <FaHome /> },
  { key: 'reports', label: 'Báo cáo', icon: <FaExclamationTriangle /> },
  { key: 'review', label: 'Duyệt review', icon: <FaStar /> },
  { key: 'processed', label: 'Đã xử lý', icon: <FaCheckCircle /> },
  { key: 'security', label: 'Bảo mật', icon: <FaShieldAlt /> },
  { key: 'notification', label: 'Thông báo', icon: <FaBell /> },
  { key: 'chatbot', label: 'Chatbot AI', icon: <FaRobot /> },
];

const ModeratorDashboard = () => {
  const [sidebarTab, setSidebarTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dashboard stats
  const [stats, setStats] = useState({
    pendingReports: { count: 0 },
    pendingReviews: { count: 0 },
    processedItems: { count: 0 }
  });
  
  // Reports
  const [reports, setReports] = useState([]);
  
  // Reviews
  const [reviews, setReviews] = useState([]);
  
  // Processed items
  const [processedItems, setProcessedItems] = useState([]);

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
          const data = await reportService.getModeratorStats();
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

  // Load reports
  useEffect(() => {
    const fetchReports = async () => {
      if (sidebarTab === 'reports') {
        try {
          setLoading(true);
          const data = await reportService.getPendingReports();
          setReports(data);
        } catch (error) {
          console.error('Error fetching reports:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchReports();
  }, [sidebarTab]);

  // Load reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (sidebarTab === 'review') {
        try {
          setLoading(true);
          const data = await reviewService.getPendingReviews();
          setReviews(data);
        } catch (error) {
          console.error('Error fetching reviews:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchReviews();
  }, [sidebarTab]);

  // Load processed items
  useEffect(() => {
    const fetchProcessedItems = async () => {
      if (sidebarTab === 'processed') {
        try {
          setLoading(true);
          const data = await reviewService.getProcessedReviews();
          setProcessedItems(data.reviews || []);
        } catch (error) {
          console.error('Error fetching processed items:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchProcessedItems();
  }, [sidebarTab]);

  const handleReportAction = async (reportId, action) => {
    try {
      await reportService.updateReportStatus(reportId, action);
      // Refresh reports list
      const data = await reportService.getPendingReports();
      setReports(data);
    } catch (error) {
      console.error('Error updating report:', error);
    }
  };

  const handleReviewAction = async (reviewId, action) => {
    try {
      await reviewService.updateReviewStatus(reviewId, action);
      // Refresh reviews list
      const data = await reviewService.getPendingReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  return (
    <div className="moderator-layout d-flex">
      {/* Sidebar trái */}
      <div className="sidebar bg-light border-end d-flex flex-column p-0" style={{ minWidth: isMobile ? '100%' : 220, minHeight: isMobile ? 'auto' : '100vh', position: isMobile ? 'static' : 'sticky', top: 0 }}>
        <div className="sidebar-header text-center py-4 border-bottom">
          <h4 className="mb-0">Moderator</h4>
          <small className="text-muted">Kiểm duyệt</small>
        </div>
        {isMobile ? (
          <Nav className="flex-row justify-content-around mt-2" variant="pills" activeKey={sidebarTab}>
            {SIDEBAR_ITEMS.filter(item => ['dashboard','reports','review','processed'].includes(item.key)).map(item => (
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
            <h2 className="dashboard-title mb-1">Moderator Dashboard</h2>
            <p className="dashboard-subtitle text-muted mb-0">Quản lý báo cáo, review, bảo mật, thông báo</p>
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
                      <FaExclamationTriangle size={40} className="text-warning mb-3" />
                      <Card.Title as="h3">{stats.pendingReports.count}</Card.Title>
                      <Card.Text className="text-muted">Báo cáo chờ xử lý</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center p-3 shadow-sm">
                    <Card.Body>
                      <FaStar size={40} className="text-info mb-3" />
                      <Card.Title as="h3">{stats.pendingReviews.count}</Card.Title>
                      <Card.Text className="text-muted">Review chờ duyệt</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center p-3 shadow-sm">
                    <Card.Body>
                      <FaCheckCircle size={40} className="text-success mb-3" />
                      <Card.Title as="h3">{stats.processedItems.count}</Card.Title>
                      <Card.Text className="text-muted">Đã xử lý hôm nay</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </>
        )}

        {/* Reports Tab */}
        {sidebarTab === 'reports' && (
          <>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Báo cáo chờ xử lý</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center"><Spinner animation="border" /></div>
                ) : reports.length > 0 ? (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Người báo cáo</th>
                        <th>Loại</th>
                        <th>Tiêu đề</th>
                        <th>Ngày báo cáo</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map(report => (
                        <tr key={report.id}>
                          <td>{report.id}</td>
                          <td>{report.reporter?.username}</td>
                          <td>{report.type}</td>
                          <td>{report.title}</td>
                          <td>{new Date(report.createdAt).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <Badge bg="warning">Chờ xử lý</Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button variant="outline-primary" size="sm">
                                <FaEye className="me-1" />Xem
                              </Button>
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => handleReportAction(report.id, 'approved')}
                              >
                                <FaCheck className="me-1" />Duyệt
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleReportAction(report.id, 'rejected')}
                              >
                                <FaTimes className="me-1" />Từ chối
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="info">Không có báo cáo nào chờ xử lý.</Alert>
                )}
              </Card.Body>
            </Card>
          </>
        )}

        {/* Review Tab */}
        {sidebarTab === 'review' && (
          <>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Review chờ duyệt</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center"><Spinner animation="border" /></div>
                ) : reviews.length > 0 ? (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Người đánh giá</th>
                        <th>Chỗ ở</th>
                        <th>Điểm</th>
                        <th>Nội dung</th>
                        <th>Ngày đánh giá</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map(review => (
                        <tr key={review.id}>
                          <td>{review.id}</td>
                          <td>{review.user?.username}</td>
                          <td>{review.accommodation?.title}</td>
                          <td>{review.rating}/5</td>
                          <td>
                            <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {review.comment}
                            </div>
                          </td>
                          <td>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button variant="outline-primary" size="sm">
                                <FaEye className="me-1" />Xem
                              </Button>
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => handleReviewAction(review.id, 'approved')}
                              >
                                <FaCheck className="me-1" />Duyệt
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleReviewAction(review.id, 'rejected')}
                              >
                                <FaTimes className="me-1" />Từ chối
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="info">Không có review nào chờ duyệt.</Alert>
                )}
              </Card.Body>
            </Card>
          </>
        )}

        {/* Processed Tab */}
        {sidebarTab === 'processed' && (
          <>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Đã xử lý</h5>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center"><Spinner animation="border" /></div>
                ) : processedItems.length > 0 ? (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Chỗ ở</th>
                        <th>Người đánh giá</th>
                        <th>Điểm</th>
                        <th>Trạng thái</th>
                        <th>Ngày xử lý</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {processedItems.map(item => (
                        <tr key={item.id}>
                          <td>{item.id}</td>
                          <td>{item.accommodation?.title || 'N/A'}</td>
                          <td>{item.user?.username || 'N/A'}</td>
                          <td>{item.rating}/5</td>
                          <td>
                            <Badge bg={item.status === 'approved' ? 'success' : 'danger'}>
                              {item.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                            </Badge>
                          </td>
                          <td>{new Date(item.moderatedAt).toLocaleDateString('vi-VN')}</td>
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
                  <Alert variant="info">Chưa có đánh giá nào được xử lý.</Alert>
                )}
              </Card.Body>
            </Card>
          </>
        )}

        {/* Security Tab */}
        {sidebarTab === 'security' && (
          <>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Bảo mật</h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="info">Chức năng bảo mật đang được phát triển.</Alert>
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
      </div>
    </div>
  );
};

export default ModeratorDashboard; 