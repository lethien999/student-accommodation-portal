import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';
import { FaSignInAlt, FaSpinner } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import './Login.css';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
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
      await login({
        email: formData.email.trim(),
        password: formData.password
      });
      navigate('/profile');
    } catch (err) {
      console.error('Login error:', err);
      setError(t('Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Đăng nhập - Student Accommodation Portal</title>
        <meta name="description" content="Đăng nhập vào hệ thống tìm kiếm nhà trọ" />
      </Helmet>
      
      <Container className="login-container">
        <div className="login-wrapper">
          <Card className="login-card shadow">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <FaSignInAlt className="login-icon mb-3" />
                <h2 className="login-title">{t('Login')}</h2>
                <p className="text-muted">{t('Welcome back')}</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('Username')}</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('Enter your email')}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>{t('Password')}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('Enter your password')}
                    required
                    className="form-control-lg"
                  />
                </Form.Group>

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
                      {t('Logging in')}
                    </>
                  ) : (
                    t('Login')
                  )}
                </Button>
              </Form>

              <div className="text-center">
                <p className="mb-0">
                  {t('Don\'t have an account?')} {' '}
                  <Link to="/register" className="register-link">
                    {t('Register')}
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

export default Login; 