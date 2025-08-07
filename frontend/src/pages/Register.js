import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';
import { FaUserPlus, FaSpinner } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import './Register.css';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Vui lòng nhập tên người dùng');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Email không hợp lệ');
      return false;
    }
    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password
      });
      navigate('/profile');
    } catch (err) {
      console.error('Registration error:', err);
      const backendMsg = err?.error || err?.message || err?.details?.[0]?.message;
      if (err.response?.data?.error?.includes('CSRF')) {
        setError('Phiên làm việc đã hết hạn. Vui lòng thử lại.');
        setTimeout(() => { window.location.reload(); }, 2000);
      } else if (backendMsg) {
        setError(backendMsg);
      } else {
        setError(t('Register failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Đăng ký - Student Accommodation Portal</title>
        <meta name="description" content="Tạo tài khoản mới để tìm kiếm nhà trọ" />
      </Helmet>
      
      <Container className="register-container">
        <div className="register-wrapper">
          <Card className="register-card shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <FaUserPlus className="register-icon mb-3" />
                <h2 className="register-title">{t('Register')}</h2>
                <p className="text-muted">Tham gia cùng chúng tôi ngay hôm nay!</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('Username')}</Form.Label>
                      <Form.Control
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder={t('Enter username')}
                        required
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('Email')}</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('Enter email')}
                        required
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('Password')}</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={t('Enter password')}
                        required
                        className="form-control-lg"
                      />
                      <Form.Text className="text-muted">
                        {t('Minimum 6 characters')}
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('Confirm Password')}</Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder={t('Enter confirm password')}
                        required
                        className="form-control-lg"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={loading}
                  className="w-100 mb-3"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="spinner me-2" />
                      {t('Register')}
                    </>
                  ) : (
                    t('Register')
                  )}
                </Button>
              </Form>

              <div className="text-center">
                <p className="mb-0">
                  Đã có tài khoản?{' '}
                  <Link to="/login" className="login-link">
                    {t('Login')}
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </>
  );
};

export default Register; 