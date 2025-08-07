import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, changePassword } from '../services/authService';
import { Container, Row, Col, Card, Button, Alert, Nav, Badge } from 'react-bootstrap';
import { FaUser, FaKey, FaSpinner, FaSignOutAlt } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import LandlordDashboard from './LandlordDashboard';
import TenantDashboard from './TenantDashboard';
import ModeratorDashboard from './ModeratorDashboard';
import AdminDashboard from './AdminDashboard';
import ReportDialog from '../components/ReportDialog';
import { TextField, Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    phone: ''
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile(formData);
      setSuccess(t('Profile updated successfully'));
    } catch (err) {
      console.error('Update profile error:', err);
      setError(t('Profile update failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('New password does not match.'));
      setLoading(false);
      return;
    }
    if (formData.newPassword.length < 6) {
      setError(t('New password must be at least 6 characters.'));
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setSuccess(t('Password changed successfully! Please log in again.'));
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Change password error:', err);
      setError(err.response?.data?.message || err.message || t('Password change failed.'));
    } finally {
      setLoading(false);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'danger',
      landlord: 'warning',
      tenant: 'info',
      moderator: 'secondary'
    };
    return <Badge bg={variants[role] || 'primary'}>{role.toUpperCase()}</Badge>;
  };

  if (!user) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{t('Please log in to view your profile')}</Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>Hồ sơ - Student Accommodation Portal</title>
        <meta name="description" content="Quản lý thông tin cá nhân và tài khoản" />
      </Helmet>

      <Container className="profile-container">
        <div className="profile-header mb-4">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h1 className="profile-title">{t('Profile')}</h1>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted">{t('Hello,')} </span>
                <strong>{user.username}</strong>
                {getRoleBadge(user.role)}
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-warning" onClick={() => setReportDialogOpen(true)}>
                {t('Report')}
              </Button>
              <Button variant="outline-danger" onClick={handleLogout}>
                <FaSignOutAlt className="me-2" />
                {t('Logout')}
              </Button>
            </div>
          </div>
        </div>

        <Row>
          <Col lg={3}>
            <Card className="profile-sidebar">
              <Card.Body>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'dashboard'}
                      onClick={() => setActiveTab('dashboard')}
                    >
                      {t('Dashboard')}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link 
                      active={activeTab === 'account'}
                      onClick={() => setActiveTab('account')}
                    >
                      <FaUser className="me-2" />
                      {t('Account')}
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={9}>
            {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
            {success && <Alert variant="success" className="mb-3">{success}</Alert>}

            {activeTab === 'dashboard' && (
              <Card>
                <Card.Body>
                  {user.role === 'tenant' && <TenantDashboard />}
                  {user.role === 'landlord' && <LandlordDashboard />}
                  {user.role === 'moderator' && <ModeratorDashboard />}
                  {user.role === 'admin' && <AdminDashboard />}
                </Card.Body>
              </Card>
            )}

            {activeTab === 'account' && (
              <Row>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Header>
                      <h5 className="mb-0">
                        <FaUser className="me-2" />
                        {t('Personal Information')}
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Box component="form" onSubmit={handleUpdateProfile} sx={{ mt: 2 }}>
                        <TextField
                          margin="normal"
                          fullWidth
                          label={t('Username')}
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          disabled
                        />
                        <TextField
                          margin="normal"
                          fullWidth
                          label={t('Email')}
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                        />
                        <TextField
                          margin="normal"
                          fullWidth
                          label={t('Phone')}
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          fullWidth
                          sx={{ mt: 2 }}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <FaSpinner className="spinner me-2" />
                              {t('Updating...')}
                            </>
                          ) : (
                            t('Update Profile')
                          )}
                        </Button>
                      </Box>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card>
                    <Card.Header>
                      <h5 className="mb-0">
                        <FaKey className="me-2" />
                        {t('Change Password')}
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <Box component="form" onSubmit={handleChangePassword} sx={{ mt: 2 }}>
                        <TextField
                          margin="normal"
                          fullWidth
                          label={t('Current Password')}
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleChange}
                          placeholder={t('Enter current password')}
                          required
                        />
                        <TextField
                          margin="normal"
                          fullWidth
                          label={t('New Password')}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleChange}
                          placeholder={t('Enter new password')}
                          required
                        />
                        <TextField
                          margin="normal"
                          fullWidth
                          label={t('Confirm New Password')}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder={t('Enter confirm new password')}
                          required
                        />
                        <Button
                          type="submit"
                          variant="warning"
                          fullWidth
                          sx={{ mt: 2 }}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <FaSpinner className="spinner me-2" />
                              {t('Changing password...')}
                            </>
                          ) : (
                            t('Change Password')
                          )}
                        </Button>
                      </Box>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </Container>
      
      <ReportDialog
        show={reportDialogOpen}
        onHide={() => setReportDialogOpen(false)}
        targetType="user"
        targetId={user.id}
        currentUser={user}
      />
    </>
  );
};

export default Profile; 