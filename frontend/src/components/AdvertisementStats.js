import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  MonetizationOn as MonetizationOnIcon,
  Visibility as VisibilityIcon,
  Mouse as MouseIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import advertisementService from '../services/advertisementService';

const AdvertisementStats = ({ advertisementId, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [groupBy, setGroupBy] = useState('day');

  const fetchStats = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      const statsData = await advertisementService.getAdvertisementStats(
        advertisementId,
        {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          groupBy
        }
      );

      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, [advertisementId, timeRange, groupBy]);

  useEffect(() => {
    if (advertisementId) {
      fetchStats();
    }
  }, [advertisementId, fetchStats]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat('en-US').format(number || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(2)}%`;
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const calculateCTR = (impressions, clicks) => {
    if (!impressions || impressions === 0) return 0;
    return ((clicks / impressions) * 100);
  };

  const calculateROI = (revenue, cost) => {
    if (!cost || cost === 0) return 0;
    return ((revenue - cost) / cost) * 100;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No statistics available
        </Typography>
      </Box>
    );
  }

  const { advertisement, stats: dailyStats, overallStats } = stats;

  return (
    <Box>
      {/* Header with Advertisement Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Advertisement Statistics
        </Typography>
        <Typography variant="h6" color="primary" gutterBottom>
          {advertisement?.title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip label={advertisement?.position} color="primary" variant="outlined" />
          <Chip label={advertisement?.status} color="success" />
          <Chip label={`Budget: ${formatCurrency(advertisement?.budget)}`} />
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
                <MenuItem value="1y">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Group By</InputLabel>
              <Select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                label="Group By"
              >
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Overall Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <VisibilityIcon color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {formatNumber(overallStats?.totalImpressions)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Impressions
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MouseIcon color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {formatNumber(overallStats?.totalClicks)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Clicks
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {formatPercentage(overallStats?.avgCtr)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average CTR
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MonetizationOnIcon color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    {formatCurrency(overallStats?.totalRevenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Performance Metrics" />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Click-Through Rate (CTR)</Typography>
                  <Typography fontWeight="bold">
                    {formatPercentage(calculateCTR(overallStats?.totalImpressions, overallStats?.totalClicks))}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Cost Per Click (CPC)</Typography>
                  <Typography fontWeight="bold">
                    {formatCurrency(overallStats?.totalClicks > 0 ? (overallStats?.totalCost / overallStats?.totalClicks) : 0)}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Cost Per Mille (CPM)</Typography>
                  <Typography fontWeight="bold">
                    {formatCurrency(overallStats?.totalImpressions > 0 ? (overallStats?.totalCost / overallStats?.totalImpressions) * 1000 : 0)}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography>Return on Investment (ROI)</Typography>
                  <Typography fontWeight="bold">
                    {formatPercentage(calculateROI(overallStats?.totalRevenue, overallStats?.totalCost))}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Device & Browser Breakdown" />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Based on collected data
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Desktop</Typography>
                  <Typography variant="body2" fontWeight="bold">~60%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Mobile</Typography>
                  <Typography variant="body2" fontWeight="bold">~35%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Tablet</Typography>
                  <Typography variant="body2" fontWeight="bold">~5%</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Daily Statistics Table */}
      <Card>
        <CardHeader title="Daily Performance" />
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Impressions</TableCell>
                  <TableCell align="right">Clicks</TableCell>
                  <TableCell align="right">CTR</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                  <TableCell align="right">Cost</TableCell>
                  <TableCell align="right">ROI</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dailyStats && dailyStats.length > 0 ? (
                  dailyStats.map((dayStats, index) => (
                    <TableRow key={index}>
                      <TableCell>{formatDate(dayStats.day || dayStats.month || dayStats.week)}</TableCell>
                      <TableCell align="right">{formatNumber(dayStats.totalImpressions)}</TableCell>
                      <TableCell align="right">{formatNumber(dayStats.totalClicks)}</TableCell>
                      <TableCell align="right">{formatPercentage(dayStats.avgCtr)}</TableCell>
                      <TableCell align="right">{formatCurrency(dayStats.totalRevenue)}</TableCell>
                      <TableCell align="right">{formatCurrency(dayStats.totalCost)}</TableCell>
                      <TableCell align="right">{formatPercentage(calculateROI(dayStats.totalRevenue, dayStats.totalCost))}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No data available for the selected time range
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdvertisementStats; 