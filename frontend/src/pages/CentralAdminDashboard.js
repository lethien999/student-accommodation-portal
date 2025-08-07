import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  CssBaseline,
  Divider,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Alert
} from '@mui/material';
import CampaignIcon from '@mui/icons-material/Campaign';
import ArticleIcon from '@mui/icons-material/Article';
import DescriptionIcon from '@mui/icons-material/Description';
import HelpIcon from '@mui/icons-material/Help';
import HomeIcon from '@mui/icons-material/Home';
import AdvertisementList from '../components/AdvertisementList';
import AdvertisementForm from '../components/AdvertisementForm';
import AdvertisementStats from '../components/AdvertisementStats';
import advertisementService from '../services/advertisementService';
import NewsManagementPage from './NewsManagementPage';
import FAQManagement from '../components/FAQManagement';
import StaticPagesManagement from '../components/StaticPagesManagement';

const drawerWidth = 240;

const SIDEBAR_ITEMS = [
  { label: 'Quản lý Quảng cáo', icon: <CampaignIcon />, key: 'ads' },
  { label: 'Quản lý Tin tức', icon: <ArticleIcon />, key: 'news' },
  { label: 'Quản lý Trang tĩnh', icon: <DescriptionIcon />, key: 'static' },
  { label: 'Quản lý FAQ', icon: <HelpIcon />, key: 'faq' },
];

const AdsManagement = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [openStats, setOpenStats] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const adsResponse = await advertisementService.getAdvertisements({ limit: 100 });
      setAdvertisements(adsResponse.advertisements || adsResponse);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateAd = () => {
    setSelectedAd(null);
    setOpenForm(true);
  };
  const handleEditAd = (ad) => {
    setSelectedAd(ad);
    setOpenForm(true);
  };
  const handleViewStats = (ad) => {
    setSelectedAd(ad);
    setOpenStats(true);
  };
  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedAd(null);
  };
  const handleStatsClose = () => {
    setOpenStats(false);
    setSelectedAd(null);
  };
  const handleFormSubmit = async (adData) => {
    try {
      if (selectedAd) {
        await advertisementService.updateAdvertisement(selectedAd.id, adData);
      } else {
        await advertisementService.createAdvertisement(adData);
      }
      handleFormClose();
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to save advertisement');
    }
  };
  const handleDeleteAd = async (adId) => {
    if (window.confirm('Bạn có chắc muốn xóa quảng cáo này?')) {
      try {
        await advertisementService.deleteAdvertisement(adId);
        fetchData();
      } catch (err) {
        setError(err.message || 'Xóa quảng cáo thất bại');
      }
    }
  };
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Tất cả Quảng cáo</Typography>
        <Button variant="contained" onClick={handleCreateAd}>Tạo Quảng cáo</Button>
      </Box>
      <AdvertisementList
        advertisements={advertisements}
        onEdit={handleEditAd}
        onDelete={handleDeleteAd}
        onViewStats={handleViewStats}
        isAdmin={true}
      />
      <Dialog open={openForm} onClose={handleFormClose} maxWidth="md" fullWidth>
        <DialogTitle>{selectedAd ? 'Sửa Quảng cáo' : 'Tạo Quảng cáo mới'}</DialogTitle>
        <DialogContent>
          <AdvertisementForm
            advertisement={selectedAd}
            onSubmit={handleFormSubmit}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={openStats} onClose={handleStatsClose} maxWidth="lg" fullWidth>
        <DialogTitle>Thống kê Quảng cáo</DialogTitle>
        <DialogContent>
          {selectedAd && (
            <AdvertisementStats
              advertisementId={selectedAd.id}
              onClose={handleStatsClose}
            />
          )}
        </DialogContent>
      </Dialog>
      {loading && <LinearProgress sx={{ mt: 2 }} />}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
};

const StaticPagesManagementPlaceholder = () => (
  <Box>
    <StaticPagesManagement />
  </Box>
);

const FAQManagementPlaceholder = () => (
  <Box>
    <FAQManagement />
  </Box>
);

const CentralAdminDashboard = () => {
  const [selected, setSelected] = useState('ads');

  const renderContent = () => {
    switch (selected) {
      case 'ads':
        return <AdsManagement />;
      case 'news':
        return <NewsManagementPage embedded />;
      case 'static':
        return <StaticPagesManagementPlaceholder />;
      case 'faq':
        return <FAQManagementPlaceholder />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button
            color="inherit"
            startIcon={<HomeIcon />}
            href="/"
            sx={{ ml: 2 }}
          >
            Quay về trang chủ
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {SIDEBAR_ITEMS.map((item) => (
            <ListItem
              button
              key={item.key}
              selected={selected === item.key}
              onClick={() => setSelected(item.key)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          {renderContent()}
        </Container>
      </Box>
    </Box>
  );
};

export default CentralAdminDashboard; 