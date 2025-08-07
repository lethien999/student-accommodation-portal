import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Badge
} from '@mui/material';
import { AccountCircle, Notifications } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import MenuIcon from '@mui/icons-material/Menu';
import { useCurrency } from '../contexts/CurrencyContext';
import { useTimezone } from '../contexts/TimezoneContext';
import MailIcon from '@mui/icons-material/Mail';
import messageService from '../services/messageService';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { currency, setCurrency, SUPPORTED_CURRENCIES } = useCurrency();
  const { timezone, setTimezone, SUPPORTED_TIMEZONES } = useTimezone();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    let interval;
    const fetchUnread = async () => {
      if (user) {
        const count = await messageService.getUnreadCount();
        setUnreadCount(count);
      }
    };
    fetchUnread();
    // Poll mỗi 30s
    if (user) {
      interval = setInterval(fetchUnread, 30000);
    }
    return () => interval && clearInterval(interval);
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleChangeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    handleClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          {t('Home')}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            color="inherit"
            component={Link}
            to="/accommodations"
          >
            {t('Search')}
          </Button>

          {user ? (
            <>
              <IconButton color="inherit" component={Link} to="/chat">
                <Badge badgeContent={unreadCount} color="error">
                  <MailIcon />
                </Badge>
              </IconButton>
              <IconButton color="inherit">
                <Notifications />
              </IconButton>
              <IconButton
                onClick={handleMenu}
                color="inherit"
              >
                {user.avatar ? (
                  <Avatar
                    src={user.avatar}
                    alt={user.username}
                    sx={{ width: 32, height: 32 }}
                  />
                ) : (
                  <AccountCircle />
                )}
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem
                  component={Link}
                  to="/profile"
                  onClick={handleClose}
                >
                  Hồ sơ
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/my-accommodations"
                  onClick={handleClose}
                >
                  Nhà trọ của tôi
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/favorites"
                  onClick={handleClose}
                >
                  Yêu thích
                </MenuItem>
                <MenuItem
                  component={Link}
                  to="/loyalty"
                  onClick={handleClose}
                >
                  Điểm thưởng
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  Đăng xuất
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={Link}
                to="/login"
              >
                {t('Login')}
              </Button>
              <Button
                color="inherit"
                component={Link}
                to="/register"
              >
                {t('Register')}
              </Button>
            </>
          )}

          <Box sx={{ ml: 2 }}>
            <Button color="inherit" onClick={handleMenu}>
              {i18n.language === 'vi' ? 'VI' : 'EN'}
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
              <MenuItem onClick={() => handleChangeLanguage('vi')}>Tiếng Việt</MenuItem>
              <MenuItem onClick={() => handleChangeLanguage('en')}>English</MenuItem>
            </Menu>
          </Box>

          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            style={{ minWidth: 80, borderRadius: 4, padding: '2px 8px' }}
            aria-label="Select currency"
          >
            {SUPPORTED_CURRENCIES.map(cur => (
              <option key={cur.code} value={cur.code}>{cur.code}</option>
            ))}
          </select>

          <select
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            style={{ minWidth: 120, borderRadius: 4, padding: '2px 8px' }}
            aria-label="Select timezone"
          >
            {SUPPORTED_TIMEZONES.map(tz => (
              <option key={tz.tz} value={tz.tz}>{tz.label}</option>
            ))}
          </select>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 