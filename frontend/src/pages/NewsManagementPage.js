import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as ExportIcon,
  BarChart as StatsIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import newsService from '../services/newsService';

const NewsManagementPage = () => {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, article: null });
  const [approveDialog, setApproveDialog] = useState({ open: false, article: null, action: '' });

  // Pagination and filters
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    featured: ''
  });

  const fetchData = useCallback(async () => {
    try {
      const [newsData, categoriesData, statsData] = await Promise.all([
        newsService.getNews({
          page: page + 1,
          limit: rowsPerPage,
          ...filters
        }),
        newsService.getCategories(),
        newsService.getNewsStats()
      ]);

      setNews(newsData.news);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    }
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async () => {
    try {
      await newsService.deleteNews(deleteDialog.article.id);
      setDeleteDialog({ open: false, article: null });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to delete article');
    }
  };

  const handleApprove = async () => {
    try {
      await newsService.approveNews(approveDialog.article.id, {
        status: approveDialog.action,
        rejectionReason: approveDialog.action === 'rejected' ? 'Rejected by admin' : null
      });
      setApproveDialog({ open: false, article: null, action: '' });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update article status');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await newsService.exportNewsData(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `news-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err.message || 'Failed to export data');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'default';
      case 'pending_review': return 'warning';
      case 'archived': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'Đã xuất bản';
      case 'draft': return 'Bản nháp';
      case 'pending_review': return 'Chờ duyệt';
      case 'archived': return 'Đã lưu trữ';
      default: return status;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Quản lý tin tức
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<StatsIcon />}
            onClick={() => navigate('/admin/news/stats')}
          >
            Thống kê
          </Button>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExport}
          >
            Xuất dữ liệu
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/admin/news/create"
          >
            Tạo bài viết mới
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Tổng bài viết
                </Typography>
                <Typography variant="h4">
                  {stats.totalArticles}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Đã xuất bản
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.publishedArticles}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Chờ duyệt
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.pendingArticles}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Tổng lượt xem
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {stats.totalViews?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm bài viết..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  label="Danh mục"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  label="Trạng thái"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="published">Đã xuất bản</MenuItem>
                  <MenuItem value="draft">Bản nháp</MenuItem>
                  <MenuItem value="pending_review">Chờ duyệt</MenuItem>
                  <MenuItem value="archived">Đã lưu trữ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Nổi bật</InputLabel>
                <Select
                  value={filters.featured}
                  onChange={(e) => setFilters(prev => ({ ...prev, featured: e.target.value }))}
                  label="Nổi bật"
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="true">Có</MenuItem>
                  <MenuItem value="false">Không</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  onClick={() => setFilters({ search: '', category: '', status: '', featured: '' })}
                >
                  Xóa bộ lọc
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* News Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tiêu đề</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Tác giả</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Lượt xem</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {news.map((article) => (
              <TableRow key={article.id}>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {article.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                      {article.isFeatured && (
                        <Chip label="Nổi bật" size="small" color="warning" />
                      )}
                      {article.isSticky && (
                        <Chip label="Ghim" size="small" color="primary" />
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {article.category ? (
                    <Chip
                      label={article.category.name}
                      size="small"
                      sx={{ backgroundColor: article.category.color, color: 'white' }}
                    />
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {article.author?.fullName || article.author?.username || '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(article.status)}
                    color={getStatusColor(article.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {article.viewCount?.toLocaleString() || 0}
                </TableCell>
                <TableCell>
                  {formatDate(article.createdAt)}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Xem">
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/news/${article.slug}`}
                        target="_blank"
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sửa">
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/admin/news/edit/${article.id}`}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    {article.status === 'pending_review' && (
                      <>
                        <Tooltip title="Duyệt">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => setApproveDialog({
                              open: true,
                              article,
                              action: 'published'
                            })}
                          >
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Từ chối">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setApproveDialog({
                              open: true,
                              article,
                              action: 'rejected'
                            })}
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                    <Tooltip title="Xóa">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, article })}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={-1}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, article: null })}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa bài viết "{deleteDialog.article?.title}"?
            Hành động này không thể hoàn tác.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, article: null })}>
            Hủy
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={approveDialog.open} onClose={() => setApproveDialog({ open: false, article: null, action: '' })}>
        <DialogTitle>
          {approveDialog.action === 'published' ? 'Duyệt bài viết' : 'Từ chối bài viết'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {approveDialog.action === 'published' 
              ? `Bạn có chắc chắn muốn duyệt bài viết "${approveDialog.article?.title}"?`
              : `Bạn có chắc chắn muốn từ chối bài viết "${approveDialog.article?.title}"?`
            }
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApproveDialog({ open: false, article: null, action: '' })}>
            Hủy
          </Button>
          <Button 
            onClick={handleApprove} 
            color={approveDialog.action === 'published' ? 'success' : 'error'} 
            variant="contained"
          >
            {approveDialog.action === 'published' ? 'Duyệt' : 'Từ chối'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NewsManagementPage; 