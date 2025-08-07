import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Button,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Skeleton,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  PushPin as PinIcon
} from '@mui/icons-material';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import newsService from '../services/newsService';

const NewsList = ({ isAdmin = false, showActions = false }) => {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination and filters
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    featured: searchParams.get('featured') || '',
    sortBy: searchParams.get('sortBy') || 'publishedAt',
    sortOrder: searchParams.get('sortOrder') || 'DESC'
  });

  const fetchNews = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...filters
      };

      const response = await newsService.getNews(params);
      setNews(response.news);
      setPagination(prev => ({
        ...prev,
        totalPages: response.pagination?.totalPages || 1,
        totalItems: response.pagination?.totalItems || (response.news ? response.news.length : 0)
      }));
    } catch (err) {
      setError(err.message || 'Failed to fetch news');
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.itemsPerPage, filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await newsService.getCategories({ activeOnly: true });
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, [fetchNews, fetchCategories]);

  const handleFilterChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) newSearchParams.set(key, val);
    });
    setSearchParams(newSearchParams);
  };

  const handlePageChange = (event, page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      featured: '',
      sortBy: 'publishedAt',
      sortOrder: 'DESC'
    });
    setSearchParams({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        await newsService.deleteNews(id);
        fetchNews();
      } catch (err) {
        setError(err.message || 'Failed to delete news');
      }
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

  if (loading && news.length === 0) {
    return (
      <Box>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Bộ lọc</Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm bài viết..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.search && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => handleFilterChange('search', '')}
                    >
                      <ClearIcon />
                    </IconButton>
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
                onChange={(e) => handleFilterChange('category', e.target.value)}
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

          {isAdmin && (
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
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
          )}

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                label="Sắp xếp"
              >
                <MenuItem value="publishedAt">Ngày xuất bản</MenuItem>
                <MenuItem value="createdAt">Ngày tạo</MenuItem>
                <MenuItem value="title">Tiêu đề</MenuItem>
                <MenuItem value="viewCount">Lượt xem</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Thứ tự</InputLabel>
              <Select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                label="Thứ tự"
              >
                <MenuItem value="DESC">Giảm dần</MenuItem>
                <MenuItem value="ASC">Tăng dần</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={clearFilters}
              startIcon={<ClearIcon />}
            >
              Xóa
            </Button>
          </Grid>
        </Grid>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* News Grid */}
      <Grid container spacing={3}>
        {news.map((article) => (
          <Grid item xs={12} md={6} lg={4} key={article.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {article.featuredImage && (
                <CardMedia
                  component="img"
                  height="200"
                  image={article.featuredImage}
                  alt={article.title}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {article.isFeatured && (
                    <Tooltip title="Bài viết nổi bật">
                      <StarIcon color="warning" sx={{ mr: 1, fontSize: 20 }} />
                    </Tooltip>
                  )}
                  {article.isSticky && (
                    <Tooltip title="Bài viết ghim">
                      <PinIcon color="primary" sx={{ mr: 1, fontSize: 20 }} />
                    </Tooltip>
                  )}
                  {isAdmin && (
                    <Chip
                      label={getStatusText(article.status)}
                      color={getStatusColor(article.status)}
                      size="small"
                      sx={{ ml: 'auto' }}
                    />
                  )}
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    color: 'inherit',
                    '&:hover': {
                      color: 'primary.main'
                    }
                  }}
                  component={Link}
                  to={`/news/${article.slug}`}
                >
                  {article.title}
                </Typography>

                {article.excerpt && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {article.excerpt}
                  </Typography>
                )}

                <Box sx={{ mt: 'auto' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {article.category && (
                      <Chip
                        label={article.category.name}
                        size="small"
                        sx={{ mr: 1, backgroundColor: article.category.color, color: 'white' }}
                      />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(article.publishedAt || article.createdAt)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {article.author && (
                        <Typography variant="caption" color="text.secondary">
                          Bởi {article.author.fullName || article.author.username}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                        {article.viewCount} lượt xem
                      </Typography>
                      {article.readingTime > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {article.readingTime} phút đọc
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {showActions && (
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        component={Link}
                        to={`/news/${article.slug}`}
                      >
                        Xem
                      </Button>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        component={Link}
                        to={`/admin/news/edit/${article.id}`}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(article.id)}
                      >
                        Xóa
                      </Button>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {news.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy bài viết nào
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default NewsList; 