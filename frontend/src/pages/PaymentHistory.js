import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';
import paymentService from '../services/paymentService';
import { Helmet } from 'react-helmet-async';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTimezone } from '../contexts/TimezoneContext';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { formatCurrency } = useCurrency();
  const { formatDateTime } = useTimezone();

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await paymentService.getPaymentHistory({ page: currentPage, limit: 10 });
      setPayments(data.payments || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError('Lỗi khi tải lịch sử giao dịch.');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleDownloadInvoice = async (paymentId) => {
    try {
      const blob = await paymentService.downloadInvoice(paymentId);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi khi tải hóa đơn:', error);
      alert('Lỗi khi tải hóa đơn.');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'success',
      pending: 'warning',
      failed: 'danger',
    };
    return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
  };
  
  const getTypeLabel = (type) => {
    const labels = {
      deposit: 'Đặt cọc',
      rent: 'Thuê trọ'
    };
    return labels[type] || type;
  };

  return (
    <>
      <Helmet>
        <title>Lịch sử giao dịch - Student Accommodation Portal</title>
      </Helmet>
      <Container className="mt-4">
        <h2 className="mb-4">Lịch sử giao dịch</h2>
        {loading && <div className="text-center"><Spinner animation="border" /></div>}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loading && !error && (
          <>
            <Table responsive striped bordered hover>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Nhà trọ</th>
                  <th>Loại</th>
                  <th>Số tiền</th>
                  <th>Phương thức</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{formatDateTime(payment.createdAt, { dateStyle: 'short', timeStyle: 'short' })}</td>
                      <td>{payment.accommodation?.title || 'N/A'}</td>
                      <td>{getTypeLabel(payment.type)}</td>
                      <td>{formatCurrency(payment.amount)}</td>
                      <td>{payment.paymentMethod.toUpperCase()}</td>
                      <td>{getStatusBadge(payment.status)}</td>
                      <td>
                        {payment.status === 'completed' && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleDownloadInvoice(payment.id)}
                          >
                            <FaDownload />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center">Chưa có giao dịch nào.</td>
                  </tr>
                )}
              </tbody>
            </Table>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center">
                <Button
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 1}
                  className="me-2"
                >
                  Trước
                </Button>
                <span className="align-self-center">Trang {currentPage} / {totalPages}</span>
                <Button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage === totalPages}
                  className="ms-2"
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </Container>
    </>
  );
};

export default PaymentHistory; 