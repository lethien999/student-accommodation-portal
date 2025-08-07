import React from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaTimesCircle } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

const PaymentFailedPage = () => {
  return (
    <>
      <Helmet>
        <title>Thanh toán thất bại - Student Accommodation Portal</title>
      </Helmet>
      <Container className="mt-5 d-flex justify-content-center">
        <Card style={{ width: '30rem' }} className="text-center">
          <Card.Body>
            <FaTimesCircle size={70} className="text-danger mb-3" />
            <Card.Title as="h2">Thanh toán thất bại!</Card.Title>
            <Card.Text>
              Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.
            </Card.Text>
            <div className="d-grid gap-2 mt-4">
              <Button as={Link} to="/" variant="primary">
                Thử lại
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

export default PaymentFailedPage; 