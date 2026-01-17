/**
 * ModeratorDashboard
 * 
 * Premium dashboard for moderators with cosmic sparkle theme.
 * Features: Report management, review moderation, security.
 * Follows Single Responsibility Principle - composed of smaller components.
 * 
 * @component
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import {
  FaShieldAlt, FaStar, FaBell, FaRobot, FaHome,
  FaExclamationTriangle, FaCheckCircle, FaEye, FaCheck, FaTimes
} from 'react-icons/fa';

// UI Components
import { DashboardLayout, StatCard, AnimatedButton } from '../components/ui';

// Services
import reportService from '../services/reportService';
import reviewService from '../services/reviewService';

// Sidebar menu items
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
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');

  // Loading & Error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dashboard stats
  const [stats, setStats] = useState({
    pendingReports: { count: 0 },
    pendingReviews: { count: 0 },
    processedItems: { count: 0 }
  });

  // Data
  const [reports, setReports] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [processedItems, setProcessedItems] = useState([]);

  // User info
  const userInfo = {
    name: 'Moderator',
    role: 'Kiểm duyệt viên',
    avatar: null,
  };

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reportService.getModeratorStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch reports
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reportService.getPendingReports();
      setReports(data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reviewService.getPendingReviews();
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch processed items
  const fetchProcessedItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reviewService.getProcessedReviews();
      setProcessedItems(data.reviews || []);
    } catch (err) {
      console.error('Error fetching processed items:', err);
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
      case 'reports':
        fetchReports();
        break;
      case 'review':
        fetchReviews();
        break;
      case 'processed':
        fetchProcessedItems();
        break;
      default:
        break;
    }
  }, [activeTab, fetchDashboardStats, fetchReports, fetchReviews, fetchProcessedItems]);

  // Handle report action
  const handleReportAction = async (reportId, action) => {
    try {
      await reportService.updateReportStatus(reportId, action);
      fetchReports();
    } catch (err) {
      console.error('Error updating report:', err);
      setError('Có lỗi xảy ra khi xử lý báo cáo.');
    }
  };

  // Handle review action
  const handleReviewAction = async (reviewId, action) => {
    try {
      await reviewService.updateReviewStatus(reviewId, action);
      fetchReviews();
    } catch (err) {
      console.error('Error updating review:', err);
      setError('Có lỗi xảy ra khi xử lý review.');
    }
  };

  // Status badge helper
  const getStatusBadge = (status) => {
    const variants = {
      pending: { bg: 'warning', label: 'Chờ xử lý' },
      approved: { bg: 'success', label: 'Đã duyệt' },
      rejected: { bg: 'danger', label: 'Đã từ chối' },
    };
    const config = variants[status] || { bg: 'secondary', label: status };
    return <span className={`badge-cosmic badge-cosmic--${config.bg}`}>{config.label}</span>;
  };

  // ========================== RENDER SECTIONS ==========================

  // Dashboard Overview
  const renderDashboard = () => (
    <>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="light" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid-stats mb-4">
            <StatCard
              title="Báo cáo chờ xử lý"
              value={stats.pendingReports?.count || 0}
              icon={<FaExclamationTriangle />}
              color="warning"
              onClick={() => setActiveTab('reports')}
            />
            <StatCard
              title="Review chờ duyệt"
              value={stats.pendingReviews?.count || 0}
              icon={<FaStar />}
              color="info"
              onClick={() => setActiveTab('review')}
            />
            <StatCard
              title="Đã xử lý hôm nay"
              value={stats.processedItems?.count || 0}
              icon={<FaCheckCircle />}
              color="success"
              onClick={() => setActiveTab('processed')}
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
                icon={<FaExclamationTriangle />}
                onClick={() => setActiveTab('reports')}
              >
                Xử lý báo cáo
              </AnimatedButton>
              <AnimatedButton
                variant="secondary"
                icon={<FaStar />}
                onClick={() => setActiveTab('review')}
              >
                Duyệt đánh giá
              </AnimatedButton>
              <AnimatedButton
                variant="secondary"
                icon={<FaCheckCircle />}
                onClick={() => setActiveTab('processed')}
              >
                Xem đã xử lý
              </AnimatedButton>
            </div>
          </div>

          {/* Recent Activity Placeholder */}
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

  // Reports Section
  const renderReports = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Báo cáo chờ xử lý</h5>
      </div>
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="light" />
        </div>
      ) : reports.length > 0 ? (
        <div className="table-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người báo cáo</th>
                <th>Loại</th>
                <th>Tiêu đề</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.reporter?.username || 'N/A'}</td>
                  <td>{report.type}</td>
                  <td>{report.title}</td>
                  <td>{new Date(report.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>{getStatusBadge('pending')}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <AnimatedButton variant="ghost" size="sm">
                        <FaEye />
                      </AnimatedButton>
                      <AnimatedButton
                        variant="success"
                        size="sm"
                        onClick={() => handleReportAction(report.id, 'approved')}
                      >
                        <FaCheck />
                      </AnimatedButton>
                      <AnimatedButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleReportAction(report.id, 'rejected')}
                      >
                        <FaTimes />
                      </AnimatedButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
          Không có báo cáo nào chờ xử lý.
        </Alert>
      )}
    </div>
  );

  // Reviews Section
  const renderReviews = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Review chờ duyệt</h5>
      </div>
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="light" />
        </div>
      ) : reviews.length > 0 ? (
        <div className="table-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>ID</th>
                <th>Người đánh giá</th>
                <th>Chỗ ở</th>
                <th>Điểm</th>
                <th>Nội dung</th>
                <th>Ngày</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(review => (
                <tr key={review.id}>
                  <td>{review.id}</td>
                  <td>{review.user?.username || 'N/A'}</td>
                  <td>{review.accommodation?.title || 'N/A'}</td>
                  <td>
                    <span className="badge-cosmic badge-cosmic--primary">{review.rating}/5</span>
                  </td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {review.comment}
                  </td>
                  <td>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <AnimatedButton variant="ghost" size="sm">
                        <FaEye />
                      </AnimatedButton>
                      <AnimatedButton
                        variant="success"
                        size="sm"
                        onClick={() => handleReviewAction(review.id, 'approved')}
                      >
                        <FaCheck />
                      </AnimatedButton>
                      <AnimatedButton
                        variant="danger"
                        size="sm"
                        onClick={() => handleReviewAction(review.id, 'rejected')}
                      >
                        <FaTimes />
                      </AnimatedButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
          Không có review nào chờ duyệt.
        </Alert>
      )}
    </div>
  );

  // Processed Items Section
  const renderProcessed = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Đã xử lý</h5>
      </div>
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" variant="light" />
        </div>
      ) : processedItems.length > 0 ? (
        <div className="table-wrapper">
          <table className="table-modern">
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
                  <td>
                    <span className="badge-cosmic badge-cosmic--primary">{item.rating}/5</span>
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>{new Date(item.moderatedAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <AnimatedButton variant="ghost" size="sm">
                      <FaEye /> Xem
                    </AnimatedButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
          Chưa có đánh giá nào được xử lý.
        </Alert>
      )}
    </div>
  );

  // Security Section
  const renderSecurity = () => (
    <div className="card-glass">
      <div className="card-glass__header">
        <h5 className="card-glass__title">Bảo mật</h5>
      </div>
      <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
        Tính năng bảo mật đang được phát triển.
      </Alert>
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
      <Alert variant="info" className="bg-transparent border-0" style={{ color: 'var(--text-secondary)' }}>
        Tính năng chatbot đang được phát triển.
      </Alert>
    </div>
  );

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return renderDashboard();
      case 'reports': return renderReports();
      case 'review': return renderReviews();
      case 'processed': return renderProcessed();
      case 'security': return renderSecurity();
      case 'notification': return renderNotifications();
      case 'chatbot': return renderChatbot();
      default: return renderDashboard();
    }
  };

  return (
    <DashboardLayout
      title="Moderator"
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

export default ModeratorDashboard;