import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Switch,
  FormControlLabel,
  Chip,
  OutlinedInput,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Preview as PreviewIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import newsService from '../services/newsService';

const NewsForm = ({ article, onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featuredImage: '',
    categoryId: '',
    status: 'draft',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
    isFeatured: false,
    isSticky: false,
    allowComments: true,
    customFields: {}
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    fetchCategories();
    if (article) {
      setFormData({
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        featuredImage: article.featuredImage || '',
        categoryId: article.categoryId || '',
        status: article.status || 'draft',
        tags: article.tags || [],
        metaTitle: article.metaTitle || '',
        metaDescription: article.metaDescription || '',
        metaKeywords: article.metaKeywords || [],
        isFeatured: article.isFeatured || false,
        isSticky: article.isSticky || false,
        allowComments: article.allowComments !== false,
        customFields: article.customFields || {}
      });
      setImagePreview(article.featuredImage || '');
    }
  }, [article]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await newsService.getCategories({ activeOnly: true });
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleTagInput = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const tag = tagInput.trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        setTagInput('');
      }
    }
  };

  const handleKeywordInput = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const keyword = keywordInput.trim();
      if (keyword && !formData.metaKeywords.includes(keyword)) {
        setFormData(prev => ({
          ...prev,
          metaKeywords: [...prev.metaKeywords, keyword]
        }));
        setKeywordInput('');
      }
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const removeKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      metaKeywords: prev.metaKeywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const generateSlug = () => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      setError('Tiêu đề và nội dung là bắt buộc');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload image if selected
      let imageUrl = formData.featuredImage;
      if (imageFile) {
        const uploadResponse = await newsService.uploadNewsImage(imageFile);
        imageUrl = uploadResponse.url;
      }

      const submitData = {
        ...formData,
        featuredImage: imageUrl
      };

      if (onSubmit) {
        await onSubmit(submitData);
      } else {
        if (article) {
          await newsService.updateNews(article.id, submitData);
        } else {
          await newsService.createNews(submitData);
        }
        navigate('/admin/news');
      }
    } catch (err) {
      setError(err.message || 'Failed to save article');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = () => {
    // Save current form data to localStorage for preview
    localStorage.setItem('newsPreview', JSON.stringify(formData));
    window.open('/admin/news/preview', '_blank');
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Card sx={{ mb: 3 }}>
        <CardHeader
          title={article ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Xem trước">
                <IconButton onClick={handlePreview}>
                  <PreviewIcon />
                </IconButton>
              </Tooltip>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={onCancel || (() => navigate('/admin/news'))}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={loading}
              >
                {loading ? 'Đang lưu...' : 'Lưu'}
              </Button>
            </Box>
          }
        />
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          {/* Basic Information */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Thông tin cơ bản" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tiêu đề bài viết"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                    helperText="Tiêu đề sẽ hiển thị trên trang web và trong kết quả tìm kiếm"
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="URL slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      helperText="URL thân thiện cho bài viết"
                    />
                    <Button
                      variant="outlined"
                      onClick={generateSlug}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      Tạo
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Tóm tắt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    helperText="Tóm tắt ngắn gọn về bài viết (tối đa 500 ký tự)"
                    inputProps={{ maxLength: 500 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={15}
                    label="Nội dung bài viết"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    required
                    helperText="Sử dụng HTML để định dạng nội dung"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Cài đặt SEO" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Meta Title"
                    value={formData.metaTitle}
                    onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                    helperText="Tiêu đề hiển thị trong kết quả tìm kiếm (tối đa 60 ký tự)"
                    inputProps={{ maxLength: 60 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Meta Description"
                    value={formData.metaDescription}
                    onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                    helperText="Mô tả hiển thị trong kết quả tìm kiếm (tối đa 160 ký tự)"
                    inputProps={{ maxLength: 160 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Meta Keywords"
                    placeholder="Nhập từ khóa và nhấn Enter hoặc dấu phẩy"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeywordInput}
                    helperText="Từ khóa SEO cho bài viết"
                  />
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.metaKeywords.map((keyword, index) => (
                      <Chip
                        key={index}
                        label={keyword}
                        onDelete={() => removeKeyword(keyword)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Publishing Settings */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Cài đặt xuất bản" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Danh mục</InputLabel>
                    <Select
                      value={formData.categoryId}
                      onChange={(e) => handleInputChange('categoryId', e.target.value)}
                      label="Danh mục"
                    >
                      <MenuItem value="">Không có danh mục</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Trạng thái</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      label="Trạng thái"
                    >
                      <MenuItem value="draft">Bản nháp</MenuItem>
                      <MenuItem value="pending_review">Chờ duyệt</MenuItem>
                      <MenuItem value="published">Đã xuất bản</MenuItem>
                      <MenuItem value="archived">Đã lưu trữ</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isFeatured}
                        onChange={(e) => handleInputChange('isFeatured', e.target.checked)}
                      />
                    }
                    label="Bài viết nổi bật"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isSticky}
                        onChange={(e) => handleInputChange('isSticky', e.target.checked)}
                      />
                    }
                    label="Ghim bài viết"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.allowComments}
                        onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                      />
                    }
                    label="Cho phép bình luận"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Ảnh đại diện" />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                {imagePreview && (
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                  />
                )}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                >
                  Tải ảnh lên
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                {imagePreview && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<ClearIcon />}
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                      handleInputChange('featuredImage', '');
                    }}
                  >
                    Xóa ảnh
                  </Button>
                )}
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Khuyến nghị: 1200x630px cho tỷ lệ tốt nhất
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader title="Tags" />
            <CardContent>
              <TextField
                fullWidth
                label="Thêm tag"
                placeholder="Nhập tag và nhấn Enter hoặc dấu phẩy"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInput}
                helperText="Tags giúp phân loại và tìm kiếm bài viết"
              />
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => removeTag(tag)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NewsForm; 