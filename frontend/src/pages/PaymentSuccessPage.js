import React from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');

  return (
    <>
      <Helmet>
        <title>Thanh toán thành công - Student Accommodation Portal</title>
      </Helmet>
      <Container className="mt-5 d-flex justify-content-center">
        <Card style={{ width: '30rem' }} className="text-center">
          <Card.Body>
            <FaCheckCircle size={70} className="text-success mb-3" />
            <Card.Title as="h2">Thanh toán thành công!</Card.Title>
            <Card.Text>
              Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Giao dịch của bạn đã được xử lý thành công.
            </Card.Text>
            {paymentId && <Alert variant="info">Mã giao dịch của bạn: <strong>{paymentId}</strong></Alert>}
            <div className="d-grid gap-2 mt-4">
              <Button as={Link} to="/payments" variant="primary">
                Xem lịch sử giao dịch
              </Button>
              <Button as={Link} to="/" variant="outline-secondary">
                Về trang chủ
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
};

export default PaymentSuccessPage; 