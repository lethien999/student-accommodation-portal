import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner, Modal, Form, Image } from 'react-bootstrap';
import twoFactorService from '../services/twoFactorService';

const TwoFactorManagement = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEnable, setShowEnable] = useState(false);
  const [qr, setQr] = useState('');
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await twoFactorService.get2FAStatus();
      setStatus(data.enabled ? 'enabled' : 'disabled');
    } catch {
      setError('Lỗi khi kiểm tra trạng thái 2FA');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Bật 2FA
  const handleEnable = async () => {
    setShowEnable(true);
    setQr('');
    setOtp('');
    setError('');
    setSuccess('');
    try {
      const data = await twoFactorService.enable2FA();
      setQr(data.qr || data.qrCode || data.qr_url || '');
    } catch {
      setError('Lỗi khi khởi tạo 2FA');
      setShowEnable(false);
    }
  };
  // Xác thực OTP khi bật 2FA
  const handleVerify = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError('');
    try {
      await twoFactorService.verify2FA(otp);
      setSuccess('Bật 2FA thành công!');
      setShowEnable(false);
      setStatus('enabled');
    } catch {
      setError('Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setVerifying(false);
    }
  };
  // Tắt 2FA
  const handleDisable = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn tắt 2FA?')) return;
    setDisabling(true);
    setError('');
    try {
      await twoFactorService.disable2FA();
      setSuccess('Đã tắt 2FA!');
      setStatus('disabled');
    } catch {
      setError('Lỗi khi tắt 2FA');
    } finally {
      setDisabling(false);
    }
  };

  return (
    <Card className="mt-4">
      <Card.Header>
        <h5 className="mb-0">Xác thực hai lớp (2FA)</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert>}
        {loading ? <div className="text-center"><Spinner animation="border" /></div> : (
          <>
            <p>Trạng thái: {status === 'enabled' ? <b className="text-success">Đã bật</b> : <b className="text-danger">Chưa bật</b>}</p>
            {status === 'enabled' ? (
              <Button variant="danger" onClick={handleDisable} disabled={disabling}>
                {disabling ? 'Đang tắt...' : 'Tắt 2FA'}
              </Button>
            ) : (
              <Button variant="primary" onClick={handleEnable}>Bật 2FA</Button>
            )}
          </>
        )}
      </Card.Body>
      {/* Modal bật 2FA */}
      <Modal show={showEnable} onHide={() => setShowEnable(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Bật xác thực hai lớp</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {qr ? (
            <>
              <p>Quét mã QR này bằng ứng dụng Google Authenticator hoặc Authy:</p>
              <div className="text-center mb-3">
                <Image src={qr} alt="QR Code 2FA" fluid style={{ maxWidth: 200 }} />
              </div>
              <Form onSubmit={handleVerify}>
                <Form.Group className="mb-2">
                  <Form.Label>Nhập mã OTP từ ứng dụng</Form.Label>
                  <Form.Control value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6} />
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button variant="secondary" onClick={() => setShowEnable(false)} className="me-2">Hủy</Button>
                  <Button type="submit" variant="success" disabled={verifying}>{verifying ? 'Đang xác thực...' : 'Xác nhận'}</Button>
                </div>
              </Form>
            </>
          ) : (
            <div className="text-center"><Spinner animation="border" /></div>
          )}
        </Modal.Body>
      </Modal>
    </Card>
  );
};

export default TwoFactorManagement; 