import React, { useEffect, useState } from 'react';
import { Card, Table, Alert, Button, Modal, Form, ProgressBar } from 'react-bootstrap';
import loyaltyService from '../services/loyaltyService';

const rewardList = [
  { name: 'Voucher 50k', points: 500 },
  { name: 'Voucher 100k', points: 900 },
  { name: 'Tặng 1 tháng phí dịch vụ', points: 2000 }
];

const getRank = (total) => {
  if (total >= 2000) return { name: 'Platinum', color: 'primary' };
  if (total >= 1000) return { name: 'Gold', color: 'warning' };
  if (total >= 500) return { name: 'Silver', color: 'secondary' };
  return { name: 'Member', color: 'info' };
};

const LoyaltyDashboard = () => {
  const [total, setTotal] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRedeem, setShowRedeem] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeemLoading, setRedeemLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    loyaltyService.getLoyaltyPoints()
      .then(data => {
        setTotal(data.total || 0);
        setHistory(data.history || []);
      })
      .catch(() => setError('Lỗi khi lấy điểm thưởng'))
      .finally(() => setLoading(false));
  }, [success]);

  const handleRedeem = async () => {
    if (!selectedReward) return;
    setRedeemLoading(true);
    setError('');
    try {
      await loyaltyService.redeemLoyaltyPoint({ points: selectedReward.points, reward: selectedReward.name });
      setSuccess(`Đổi điểm lấy ${selectedReward.name} thành công!`);
      setShowRedeem(false);
    } catch {
      setError('Lỗi khi đổi điểm');
    } finally {
      setRedeemLoading(false);
    }
  };

  const rank = getRank(total);
  const nextRank = rank.name === 'Platinum' ? null : getRank(rank.name === 'Gold' ? 2000 : rank.name === 'Silver' ? 1000 : 500);
  const nextRankPoint = nextRank ? (nextRank.name === 'Gold' ? 1000 : nextRank.name === 'Platinum' ? 2000 : 500) : null;

  return (
    <Card className="mt-4">
      <Card.Header>
        <b>Điểm thưởng & Khách hàng thân thiết</b>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
        <div className="mb-3">
          <h4>Tổng điểm: <span className={`text-${rank.color}`}>{total}</span></h4>
          <div>Cấp bậc: <b className={`text-${rank.color}`}>{rank.name}</b></div>
          {nextRank && <div>Tiến trình lên <b>{nextRank.name}</b>: <ProgressBar now={Math.min(100, (total / nextRankPoint) * 100)} label={`${total}/${nextRankPoint}`} /> </div>}
        </div>
        <h5>Lịch sử tích/tiêu điểm</h5>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Hành động</th>
              <th>Điểm</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? <tr><td colSpan={4} className="text-center">Không có dữ liệu</td></tr> :
              history.map(h => (
                <tr key={h.id}>
                  <td>{new Date(h.createdAt).toLocaleString('vi-VN')}</td>
                  <td>{h.action}</td>
                  <td className={h.points > 0 ? 'text-success' : 'text-danger'}>{h.points > 0 ? '+' : ''}{h.points}</td>
                  <td>{h.note}</td>
                </tr>
              ))}
          </tbody>
        </Table>
        <h5>Ưu đãi có thể đổi điểm</h5>
        <div className="d-flex gap-3 flex-wrap">
          {rewardList.map(r => (
            <Card key={r.name} style={{ minWidth: 200 }} className="mb-2">
              <Card.Body>
                <div><b>{r.name}</b></div>
                <div>Yêu cầu: <b>{r.points}</b> điểm</div>
                <Button
                  variant="primary"
                  disabled={total < r.points}
                  onClick={() => { setSelectedReward(r); setShowRedeem(true); }}
                >
                  Đổi điểm
                </Button>
              </Card.Body>
            </Card>
          ))}
        </div>
        <Modal show={showRedeem} onHide={() => setShowRedeem(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Đổi điểm lấy ưu đãi</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedReward && (
              <div>
                <p>Bạn chắc chắn muốn đổi <b>{selectedReward.points}</b> điểm lấy <b>{selectedReward.name}</b>?</p>
                <Button variant="secondary" onClick={() => setShowRedeem(false)} className="me-2">Hủy</Button>
                <Button variant="success" onClick={handleRedeem} disabled={redeemLoading}>{redeemLoading ? 'Đang xử lý...' : 'Xác nhận'}</Button>
              </div>
            )}
          </Modal.Body>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default LoyaltyDashboard; 