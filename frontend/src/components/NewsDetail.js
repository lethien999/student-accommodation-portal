import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  Button,
  TextField,
  Alert,
  Skeleton,
  Grid,
  Paper,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Star as StarIcon,
  PushPin as PinIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Send as SendIcon,
  ThumbUp as LikeIcon,
  ThumbDown as DislikeIcon,
  Reply as ReplyIcon
} from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import newsService from '../services/newsService';

const NewsDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentForm, setCommentForm] = useState({
    authorName: '',
    authorEmail: '',
    content: '',
    parentId: null
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);

  const fetchArticle = React.useCallback(async () => {
    try {
      setLoading(true);
      const [articleData, relatedData] = await Promise.all([
        newsService.getNewsBySlug(slug),
        newsService.getRelatedNews(article?.id || 0, { limit: 3 })
      ]);
      
      setArticle(articleData);
      setComments(articleData.comments || []);
      setRelatedArticles(relatedData);
    } catch (err) {
      setError(err.message || 'Failed to fetch article');
    } finally {
      setLoading(false);
    }
  }, [slug, article?.id]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentForm.authorName || !commentForm.authorEmail || !commentForm.content) {
      setCommentError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentError(null);
      
      const newComment = await newsService.createComment(article.id, commentForm);
      setComments(prev => [newComment, ...prev]);
      
      setCommentForm({
        authorName: '',
        authorEmail: '',
        content: '',
        parentId: null
      });
    } catch (err) {
      setCommentError(err.message || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = article.excerpt || article.title;

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
  };

  const renderComment = (comment, level = 0) => (
    <Box key={comment.id} sx={{ ml: level * 3 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
            {comment.author ? (
              comment.author.avatar ? (
                <img src={comment.author.avatar} alt={comment.author.fullName} />
              ) : (
                <PersonIcon />
              )
            ) : (
              <PersonIcon />
            )}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2">
              {comment.author ? (comment.author.fullName || comment.author.username) : comment.authorName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(comment.createdAt)}
            </Typography>
          </Box>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          {comment.content}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small">
            <LikeIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption">{comment.likes}</Typography>
          <IconButton size="small">
            <DislikeIcon fontSize="small" />
          </IconButton>
          <Typography variant="caption">{comment.dislikes}</Typography>
          <Button size="small" startIcon={<ReplyIcon />}>
            Trả lời
          </Button>
        </Box>

        {/* Render replies */}
        {comment.replies && comment.replies.length > 0 && (
          <Box sx={{ mt: 2 }}>
            {comment.replies.map(reply => renderComment(reply, level + 1))}
          </Box>
        )}
      </Paper>
    </Box>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Skeleton variant="rectangular" height={400} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={60} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
        <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
      </Container>
    );
  }

  if (error || !article) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          {error || 'Bài viết không tồn tại'}
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${article.title} - Student Accommodation Portal`}</title>
        <meta name="description" content={article.metaDescription || article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.metaDescription || article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        {article.featuredImage && (
          <meta property="og:image" content={article.featuredImage} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.metaDescription || article.excerpt} />
        {article.featuredImage && (
          <meta name="twitter:image" content={article.featuredImage} />
        )}
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
          {article.category && (
            <MuiLink component={Link} to={`/news/categories/${article.category.slug}`} color="inherit">
              {article.category.name}
            </MuiLink>
          )}
          <Typography color="text.primary">{article.title}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            {/* Article Content */}
            <Card sx={{ mb: 4 }}>
              {article.featuredImage && (
                <Box
                  component="img"
                  src={article.featuredImage}
                  alt={article.title}
                  sx={{
                    width: '100%',
                    height: 400,
                    objectFit: 'cover'
                  }}
                />
              )}

              <CardContent sx={{ p: 4 }}>
                {/* Article Header */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {article.isFeatured && (
                      <Tooltip title="Bài viết nổi bật">
                        <StarIcon color="warning" sx={{ mr: 1 }} />
                      </Tooltip>
                    )}
                    {article.isSticky && (
                      <Tooltip title="Bài viết ghim">
                        <PinIcon color="primary" sx={{ mr: 1 }} />
                      </Tooltip>
                    )}
                    {article.category && (
                      <Chip
                        label={article.category.name}
                        size="small"
                        sx={{
                          mr: 1,
                          backgroundColor: article.category.color,
                          color: 'white'
                        }}
                      />
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {article.viewCount} lượt xem
                    </Typography>
                  </Box>

                  <Typography variant="h4" component="h1" gutterBottom>
                    {article.title}
                  </Typography>

                  {article.excerpt && (
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                      {article.excerpt}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                        {article.author?.avatar ? (
                          <img src={article.author.avatar} alt={article.author.fullName} />
                        ) : (
                          <PersonIcon />
                        )}
                      </Avatar>
                      <Typography variant="body2">
                        {article.author?.fullName || article.author?.username}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarIcon sx={{ mr: 0.5, fontSize: 16 }} />
                      <Typography variant="body2">
                        {formatDate(article.publishedAt || article.createdAt)}
                      </Typography>
                    </Box>
                    {article.readingTime > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TimeIcon sx={{ mr: 0.5, fontSize: 16 }} />
                        <Typography variant="body2">
                          {article.readingTime} phút đọc
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Tags */}
                  {article.tags && article.tags.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {article.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Article Content */}
                <Box
                  component="div"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                  sx={{
                    '& img': {
                      maxWidth: '100%',
                      height: 'auto'
                    },
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                      mt: 3,
                      mb: 2
                    },
                    '& p': {
                      mb: 2,
                      lineHeight: 1.8
                    }
                  }}
                />

                {/* Share Buttons */}
                <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" gutterBottom>
                    Chia sẻ bài viết
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton onClick={() => handleShare('facebook')} color="primary">
                      <FacebookIcon />
                    </IconButton>
                    <IconButton onClick={() => handleShare('twitter')} color="info">
                      <TwitterIcon />
                    </IconButton>
                    <IconButton onClick={() => handleShare('linkedin')} color="primary">
                      <LinkedInIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Comments Section */}
            {article.allowComments && (
              <Card>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" gutterBottom>
                    Bình luận ({comments.length})
                  </Typography>

                  {/* Comment Form */}
                  <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4 }}>
                    {commentError && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {commentError}
                      </Alert>
                    )}

                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Tên của bạn"
                          value={commentForm.authorName}
                          onChange={(e) => setCommentForm(prev => ({
                            ...prev,
                            authorName: e.target.value
                          }))}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={commentForm.authorEmail}
                          onChange={(e) => setCommentForm(prev => ({
                            ...prev,
                            authorEmail: e.target.value
                          }))}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          multiline
                          rows={4}
                          label="Bình luận"
                          value={commentForm.content}
                          onChange={(e) => setCommentForm(prev => ({
                            ...prev,
                            content: e.target.value
                          }))}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SendIcon />}
                          disabled={submittingComment}
                        >
                          {submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ mb: 3 }} />

                  {/* Comments List */}
                  <Box>
                    {comments.length > 0 ? (
                      comments.map(comment => renderComment(comment))
                    ) : (
                      <Typography color="text.secondary" textAlign="center">
                        Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Bài viết liên quan
                  </Typography>
                  {relatedArticles.map((related) => (
                    <Box key={related.id} sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                      <Typography
                        variant="subtitle2"
                        component={Link}
                        to={`/news/${related.slug}`}
                        sx={{
                          textDecoration: 'none',
                          color: 'inherit',
                          '&:hover': {
                            color: 'primary.main'
                          }
                        }}
                      >
                        {related.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(related.publishedAt || related.createdAt)}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Article Stats */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thống kê bài viết
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Lượt xem:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {article.viewCount}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Bình luận:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {comments.length}
                    </Typography>
                  </Box>
                  {article.readingTime > 0 && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Thời gian đọc:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {article.readingTime} phút
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default NewsDetail; 