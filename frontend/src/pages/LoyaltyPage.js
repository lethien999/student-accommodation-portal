import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Spinner, Alert, Badge } from 'react-bootstrap';
import loyaltyService from '../services/loyaltyService';
import MainLayout from '../layouts/MainLayout'; // Assuming a main layout exists

const LoyaltyPage = () => {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const balanceData = await loyaltyService.getBalance();
        const historyData = await loyaltyService.getHistory();
        setBalance(balanceData.balance);
        setHistory(historyData);
      } catch (err) {
        setError('Không thể tải dữ liệu điểm thưởng. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderHistory = () => {
    if (history.length === 0) {
      return (
        <tr>
          <td colSpan="4" className="text-center">Bạn chưa có lịch sử giao dịch điểm.</td>
        </tr>
      );
    }

    return history.map((item) => (
      <tr key={item.id}>
        <td>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
        <td>{item.description}</td>
        <td>
          {item.type === 'earn' ? (
            <Badge bg="success">Tích điểm</Badge>
          ) : (
            <Badge bg="warning">Đổi điểm</Badge>
          )}
        </td>
        <td className={`fw-bold ${item.points > 0 ? 'text-success' : 'text-danger'}`}>
          {item.points > 0 ? `+${item.points}` : item.points}
        </td>
      </tr>
    ));
  };

  return (
    <MainLayout>
      <Container className="mt-5">
        <Card>
          <Card.Header as="h4">Chương trình Khách hàng thân thiết</Card.Header>
          <Card.Body>
            <Card.Title>Số dư điểm của bạn</Card.Title>
            <h1 className="display-4 text-primary fw-bold">{balance.toLocaleString()} điểm</h1>
            <hr />
            <h5 className="mt-4">Lịch sử điểm thưởng</h5>
            {loading && <div className="text-center"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && !error && (
              <Table striped bordered hover responsive className="mt-3">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Mô tả</th>
                    <th>Loại</th>
                    <th>Điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {renderHistory()}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </MainLayout>
  );
};

export default LoyaltyPage;
