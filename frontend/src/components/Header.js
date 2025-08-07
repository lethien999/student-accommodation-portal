import React from 'react';
import { Navbar, Nav, NavDropdown, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleTheme = () => {
    setTheme(theme.mode === 'dark' ? 'light' : 'dark');
  };

  return (
    <Navbar bg={theme.mode} variant={theme.mode} expand="lg" sticky="top">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>Accommodation Portal</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/news">
              <Nav.Link>Tin tức</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/search">
              <Nav.Link>Tìm kiếm</Nav.Link>
            </LinkContainer>
            {user && (
              <LinkContainer to="/favorites">
                <Nav.Link>Yêu thích</Nav.Link>
              </LinkContainer>
            )}
            {user && (
              <LinkContainer to="/messages">
                <Nav.Link>Tin nhắn</Nav.Link>
              </LinkContainer>
            )}
            {user && (
              <LinkContainer to="/events">
                <Nav.Link>Sự kiện</Nav.Link>
              </LinkContainer>
            )}
            {user && (
              <LinkContainer to="/maintenance">
                <Nav.Link>Bảo trì</Nav.Link>
              </LinkContainer>
            )}
            {user && (
              <LinkContainer to="/push-settings">
                <Nav.Link>Thông báo đẩy</Nav.Link>
              </LinkContainer>
            )}
            {user && (
              <LinkContainer to="/documents">
                <Nav.Link>Tài liệu số</Nav.Link>
              </LinkContainer>
            )}
          </Nav>
          <Nav>
            <Button variant="outline-secondary" onClick={toggleTheme} className="me-2">
              {theme.mode === "dark" ? 'Sáng' : 'Tối'}
            </Button>
            {user ? (
              <NavDropdown title={user.username || 'Tài khoản'} id="basic-nav-dropdown">
                <LinkContainer to="/profile">
                  <NavDropdown.Item>Hồ sơ</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/payments">
                  <NavDropdown.Item>Lịch sử thanh toán</NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Đăng nhập</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/register">
                  <Nav.Link>Đăng ký</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 