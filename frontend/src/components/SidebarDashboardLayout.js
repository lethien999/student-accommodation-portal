import React, { useState } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, AppBar, Typography, CssBaseline, Divider, Container, IconButton, Avatar, Collapse, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupIcon from '@mui/icons-material/Group';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HelpIcon from '@mui/icons-material/Help';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 220;

const defaultGroups = [
  {
    label: 'Quản lý',
    icon: <DashboardIcon />,
    items: [], // truyền từ props
  },
  {
    label: 'Tài khoản',
    icon: <SettingsIcon />,
    items: [
      { label: 'Thông tin cá nhân', icon: <GroupIcon />, onClick: () => window.location.href = '/profile' },
      { label: 'Đăng xuất', icon: <LogoutIcon />, onClick: () => window.location.href = '/logout' },
    ],
  },
  {
    label: 'Hỗ trợ',
    icon: <HelpIcon />,
    items: [
      { label: 'Trợ giúp', icon: <HelpIcon />, onClick: () => window.location.href = '/faq' },
    ],
  },
];

const SidebarDashboardLayout = ({ groups = defaultGroups, children, title }) => {
  const [openGroups, setOpenGroups] = useState(groups.map(() => true));
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const handleToggleGroup = idx => {
    setOpenGroups(openGroups => openGroups.map((v, i) => i === idx ? !v : v));
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setCollapsed(c => !c)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title || 'Dashboard'}
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ mr: 1 }}>{user.username?.[0]?.toUpperCase() || '?'}</Avatar>
              <Typography variant="body1">{user.username}</Typography>
              <Typography variant="caption" sx={{ ml: 1, color: 'gray' }}>({user.role})</Typography>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? 64 : drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: collapsed ? 64 : drawerWidth,
            boxSizing: 'border-box',
            transition: 'width 0.2s',
            overflowX: 'hidden',
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {groups.map((group, idx) => (
            <Box key={group.label}>
              <ListItem button onClick={() => handleToggleGroup(idx)}>
                <Tooltip title={group.label} placement="right" disableHoverListener={!collapsed}>
                  <ListItemIcon>{group.icon}</ListItemIcon>
                </Tooltip>
                {!collapsed && <ListItemText primary={group.label} />}
                {!collapsed && (openGroups[idx] ? <ExpandLess /> : <ExpandMore />)}
              </ListItem>
              <Collapse in={openGroups[idx] && !collapsed} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {group.items.map(item => (
                    <ListItem button key={item.label} onClick={item.onClick} sx={{ pl: 4 }}>
                      <Tooltip title={item.label} placement="right" disableHoverListener={!collapsed}>
                        <ListItemIcon>{item.icon}</ListItemIcon>
                      </Tooltip>
                      {!collapsed && <ListItemText primary={item.label} />}
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            </Box>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default SidebarDashboardLayout; 