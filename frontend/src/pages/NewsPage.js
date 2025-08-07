import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Alert
} from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import NewsList from '../components/NewsList';
import newsService from '../services/newsService';

const NewsPage = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');
  const [category, setCategory] = useState(null);
  const [error, setError] = useState(null);

  const fetchCategory = React.useCallback(async () => {
    if (categorySlug) {
      try {
        const categoryData = await newsService.getCategoryBySlug(categorySlug);
        setCategory(categoryData.category);
      } catch (err) {
        setError(err.message || 'Failed to fetch category');
      }
    } else {
      setCategory(null);
    }
  }, [categorySlug]);

  useEffect(() => {
    fetchCategory();
  }, [fetchCategory]);

  return (
    <>
      <Helmet>
        <title>
          {category ? `${category.name} - Tin tức` : 'Tin tức - Student Accommodation Portal'}
        </title>
        <meta name="description" content="Tin tức mới nhất về nhà trọ, sinh viên và các vấn đề liên quan" />
        <meta property="og:title" content={category ? `${category.name} - Tin tức` : 'Tin tức - Student Accommodation Portal'} />
        <meta property="og:description" content="Tin tức mới nhất về nhà trọ, sinh viên và các vấn đề liên quan" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <MuiLink component={Link} to="/" color="inherit">
            Trang chủ
          </MuiLink>
          <MuiLink component={Link} to="/news" color="inherit">
            Tin tức
          </MuiLink>
          {category && (
            <Typography color="text.primary">{category.name}</Typography>
          )}
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            {category ? category.name : 'Tin tức'}
          </Typography>
          {category && category.description && (
            <Typography variant="body1" color="text.secondary">
              {category.description}
            </Typography>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* News List */}
        <NewsList />
      </Container>
    </>
  );
};

export default NewsPage; 