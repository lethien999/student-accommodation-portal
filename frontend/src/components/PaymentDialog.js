import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, InputGroup } from 'react-bootstrap';
import paymentService from '../services/paymentService';
import loyaltyService from '../services/loyaltyService';
import { useAuth } from '../contexts/AuthContext';

// Import logos
import vnpayLogo from '../assets/images/vnpay.png';
import momoLogo from '../assets/images/momo.png';
const zalopayLogo = 'https://static.zalopay.com.vn/website/images/logo-primary.svg';
const applepayLogo = 'https://developer.apple.com/design/human-interface-guidelines/apple-pay/images/apple-pay-mark-logo.png';
const googlepayLogo = 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Google_Pay_Logo.svg';

const VND_PER_POINT = 100; // Should be consistent with backend config

const PaymentDialog = ({ show, onHide, accommodation, type }) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Loyalty state
  const [balance, setBalance] = useState(0);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const initialAmount = type === 'deposit' ? accommodation?.depositAmount : accommodation?.price;
  const discountAmount = pointsToRedeem * VND_PER_POINT;
  const finalAmount = Math.max(0, initialAmount - discountAmount);
  
  useEffect(() => {
    // Fetch loyalty balance when the dialog is shown for a logged-in user
    if (show && user) {
      loyaltyService.getBalance()
        .then(data => setBalance(data.balance))
        .catch(err => console.error("Failed to fetch loyalty balance:", err));
    }
    // Reset state on hide
    if (!show) {
      setPointsToRedeem(0);
      setPaymentMethod('');
      setError('');
    }
  }, [show, user]);

  const handlePayment = async () => {
    if (!paymentMethod) {
      setError('Vui lòng chọn phương thức thanh toán.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const paymentData = {
        accommodationId: accommodation.id,
        type,
        paymentMethod,
        pointsToRedeem: Number(pointsToRedeem) || 0
      };

      const response = await paymentService.createPayment(paymentData);
      
      // Redirect to payment URL from backend
      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        setError('Không thể tạo URL thanh toán. Vui lòng thử lại.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi xử lý thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  const handlePointsChange = (e) => {
    let points = Number(e.target.value);
    if (isNaN(points) || points < 0) {
      points = 0;
    }
    if (points > balance) {
      points = balance;
    }
    // Also check if discount exceeds amount
    if (points * VND_PER_POINT > initialAmount) {
        points = Math.floor(initialAmount / VND_PER_POINT);
    }
    setPointsToRedeem(points);
  };

  const title = type === 'deposit' ? 'Đặt cọc giữ chỗ' : 'Thanh toán tiền thuê';

  // Kiểm tra Payment Request API
  const isApplePaySupported = window.ApplePaySession || (window.PaymentRequest && navigator.userAgent.includes('Safari'));
  const isGooglePaySupported = window.PaymentRequest && navigator.userAgent.includes('Chrome');

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <h5>{accommodation?.name}</h5>
          <p className="text-muted">{accommodation?.address}</p>
          <h4 className="text-primary">
            Số tiền: {initialAmount?.toLocaleString('vi-VN')}đ
          </h4>
        </div>
        
        {user && balance > 0 && (
          <Form.Group className="mb-3">
            <Form.Label>Sử dụng điểm thưởng (Bạn có: {balance.toLocaleString()} điểm)</Form.Label>
            <InputGroup>
              <Form.Control 
                type="number"
                value={pointsToRedeem}
                onChange={handlePointsChange}
                max={balance}
                min={0}
              />
              <Button variant="outline-secondary" onClick={() => setPointsToRedeem(balance)}>Dùng hết</Button>
            </InputGroup>
            <Form.Text>
              Bạn sẽ được giảm: {discountAmount.toLocaleString('vi-VN')}đ
            </Form.Text>
          </Form.Group>
        )}
        
        {pointsToRedeem > 0 && (
            <div className="text-center mb-3">
                <h5 className="text-success fw-bold">
                    Tổng tiền sau khi giảm: {finalAmount.toLocaleString('vi-VN')}đ
                </h5>
            </div>
        )}

        <Form.Group>
          <Form.Label as="legend" column sm={12} className="mb-3">
            Chọn phương thức thanh toán
          </Form.Label>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Button 
              variant={paymentMethod === 'vnpay' ? 'primary' : 'outline-primary'}
              onClick={() => setPaymentMethod('vnpay')}
              className="payment-method-btn"
            >
              <img src={vnpayLogo} height={30} alt="VNPay" />
              <span className="ms-2">VNPay</span>
            </Button>
            <Button 
              variant={paymentMethod === 'momo' ? 'danger' : 'outline-danger'}
              onClick={() => setPaymentMethod('momo')}
              className="payment-method-btn"
            >
              <img src={momoLogo} height={30} alt="MoMo" />
              <span className="ms-2">MoMo</span>
            </Button>
            <Button 
              variant={paymentMethod === 'paypal' ? 'info' : 'outline-info'}
              onClick={() => setPaymentMethod('paypal')}
              className="payment-method-btn"
            >
              <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" height={30} />
              <span className="ms-2">PayPal</span>
            </Button>
            <Button 
              variant={paymentMethod === 'stripe' ? 'dark' : 'outline-dark'}
              onClick={() => setPaymentMethod('stripe')}
              className="payment-method-btn"
            >
              <img src="https://stripe.com/img/v3/home/twitter.png" alt="Stripe" height={30} />
              <span className="ms-2">Stripe</span>
            </Button>
            <Button 
              variant={paymentMethod === 'zalopay' ? 'info' : 'outline-info'}
              onClick={() => setPaymentMethod('zalopay')}
              className="payment-method-btn"
            >
              <img src={zalopayLogo} height={30} alt="ZaloPay" />
              <span className="ms-2">ZaloPay</span>
            </Button>
            <Button 
              variant={paymentMethod === 'applepay' ? 'dark' : 'outline-dark'}
              onClick={() => setPaymentMethod('applepay')}
              className="payment-method-btn"
              disabled={!isApplePaySupported}
            >
              <img src={applepayLogo} height={30} alt="Apple Pay" />
              <span className="ms-2">Apple Pay</span>
            </Button>
            <Button 
              variant={paymentMethod === 'googlepay' ? 'success' : 'outline-success'}
              onClick={() => setPaymentMethod('googlepay')}
              className="payment-method-btn"
              disabled={!isGooglePaySupported}
            >
              <img src={googlepayLogo} height={30} alt="Google Pay" />
              <span className="ms-2">Google Pay</span>
            </Button>
          </div>
        </Form.Group>

        {error && <Alert variant="danger" className="mt-4">{error}</Alert>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button
          onClick={handlePayment}
          variant="success"
          disabled={!paymentMethod || loading}
        >
          {loading ? (
            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
          ) : (
            'Tiến hành thanh toán'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PaymentDialog; 