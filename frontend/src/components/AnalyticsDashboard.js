import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import analyticsService from '../services/analyticsService';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [userTrends, setUserTrends] = useState(null);
  const [revenueTrends, setRevenueTrends] = useState(null);
  const [topLandlords, setTopLandlords] = useState([]);
  const [accommodationInsights, setAccommodationInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [s, u, r, l, a] = await Promise.all([
          analyticsService.getDashboardStats(),
          analyticsService.getUserActivityTrends(),
          analyticsService.getRevenueTrends(),
          analyticsService.getTopLandlords(),
          analyticsService.getAccommodationInsights()
        ]);
        setStats(s);
        setUserTrends(u);
        setRevenueTrends(r);
        setTopLandlords(l);
        setAccommodationInsights(a);
      } catch (e) {
        setError('Lỗi khi lấy dữ liệu phân tích');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <Row className="mb-4">
        <Col md={3}><Card body><b>Người dùng</b><br />{stats?.users}</Card></Col>
        <Col md={3}><Card body><b>Hợp đồng</b><br />{stats?.contracts}</Card></Col>
        <Col md={3}><Card body><b>Doanh thu</b><br />{stats?.revenue}</Card></Col>
        <Col md={3}><Card body><b>Sự kiện</b><br />{stats?.events}</Card></Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <Card body>
            <b>Hoạt động người dùng</b>
            {userTrends && <Line data={{
              labels: userTrends.labels,
              datasets: [{
                label: 'Hoạt động',
                data: userTrends.data,
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25,118,210,0.2)'
              }]
            }} />}
          </Card>
        </Col>
        <Col md={6}>
          <Card body>
            <b>Doanh thu</b>
            {revenueTrends && <Bar data={{
              labels: revenueTrends.labels,
              datasets: [{
                label: 'Doanh thu',
                data: revenueTrends.data,
                backgroundColor: '#43a047'
              }]
            }} />}
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        <Col md={6}>
          <Card body>
            <b>Top chủ trọ uy tín</b>
            {topLandlords.length > 0 && <Pie data={{
              labels: topLandlords.map(l => l.name),
              datasets: [{
                data: topLandlords.map(l => l.score),
                backgroundColor: ['#1976d2', '#ff9800', '#43a047', '#8e24aa', '#757575']
              }]
            }} />}
          </Card>
        </Col>
        <Col md={6}>
          <Card body>
            <b>Phân tích chỗ ở</b>
            {accommodationInsights && <Bar data={{
              labels: accommodationInsights.labels,
              datasets: [{
                label: 'Tỉ lệ lấp đầy',
                data: accommodationInsights.occupancy,
                backgroundColor: '#ff9800'
              }, {
                label: 'Giá trung bình',
                data: accommodationInsights.avgPrice,
                backgroundColor: '#1976d2'
              }]
            }} />}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard; 