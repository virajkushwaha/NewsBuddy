import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Chip,
  Box,
  Avatar,
  Button
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Share,
  Bookmark,
  BookmarkBorder,
  Visibility,
  AccessTime,
  OpenInNew
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const ArticleCard = ({ 
  article, 
  showCategory = false,
  showSource = false
}) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCardClick = () => {
    if (article.url && article.url !== 'https://example.com/article-0') {
      window.open(article.url, '_blank');
    }
  };

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(!liked);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setBookmarked(!bookmarked);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: article.title,
        url: article.url
      });
    } else {
      navigator.clipboard.writeText(article.url);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      business: 'primary',
      entertainment: 'secondary',
      health: 'success',
      science: 'info',
      sports: 'warning',
      technology: 'error',
      general: 'default'
    };
    return colors[category] || 'default';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      business: '💼',
      entertainment: '🎬',
      health: '🏥',
      science: '🔬',
      sports: '⚽',
      technology: '💻',
      general: '📰'
    };
    return icons[category] || '📰';
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        borderRadius: 3,
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        },
      }}
      onClick={handleCardClick}
    >
      {/* Image */}
      <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
        {article.urlToImage && !imageError ? (
          <CardMedia
            component="img"
            image={article.urlToImage}
            alt={article.title}
            onError={() => setImageError(true)}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <Typography variant="h3">📰</Typography>
          </Box>
        )}

        {/* Category Chip */}
        {showCategory && article.category && (
          <Chip
            label={`${getCategoryIcon(article.category)} ${article.category.toUpperCase()}`}
            color={getCategoryColor(article.category)}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              fontWeight: 600,
              fontSize: '0.75rem',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255,255,255,0.9)',
            }}
          />
        )}

        {/* Read More Button */}
        <Button
          variant="contained"
          size="small"
          startIcon={<OpenInNew />}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            borderRadius: 20,
            textTransform: 'none',
            fontSize: '0.75rem',
            opacity: 0,
            transition: 'opacity 0.3s',
            '.MuiCard-root:hover &': {
              opacity: 1,
            },
          }}
        >
          Read
        </Button>
      </Box>

      {/* Content */}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontSize: '1.1rem',
            fontWeight: 600,
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1,
          }}
        >
          {article.title}
        </Typography>

        {article.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2,
              lineHeight: 1.4,
            }}
          >
            {article.description}
          </Typography>
        )}

        {/* Source and Time */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
          {showSource && article.source?.name && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                {article.source.name[0]}
              </Avatar>
              <Typography variant="caption" color="primary" fontWeight={600}>
                {article.source.name}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTime sx={{ fontSize: 14 }} color="action" />
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ px: 2, pb: 2, pt: 0, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Views */}
          {article.views > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Visibility sx={{ fontSize: 16 }} color="action" />
              <Typography variant="caption" color="text.secondary">
                {article.views}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={handleLike} color={liked ? 'error' : 'default'}>
            {liked ? <Favorite /> : <FavoriteBorder />}
          </IconButton>

          <IconButton size="small" onClick={handleBookmark} color={bookmarked ? 'primary' : 'default'}>
            {bookmarked ? <Bookmark /> : <BookmarkBorder />}
          </IconButton>

          <IconButton size="small" onClick={handleShare}>
            <Share />
          </IconButton>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ArticleCard;