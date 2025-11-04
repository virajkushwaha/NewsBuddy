import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { TrendingUp, Whatshot, Timeline } from '@mui/icons-material';
import ArticleCard from '../components/News/ArticleCard';
import newsService from '../services/newsService';

const Trending = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrendingArticles();
  }, []);

  const loadTrendingArticles = async () => {
    try {
      const response = await newsService.getTrending(20);
      
      if (response && response.success && response.data && response.data.length > 0) {
        setArticles(response.data);
        setError(null);
      } else {
        setError('No trending articles available');
      }
    } catch (err) {
      console.error('Trending API Error:', err);
      setError('Failed to load trending articles');
    } finally {
      setLoading(false);
    }
  };



  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)', color: 'white' }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Whatshot sx={{ fontSize: 40 }} />
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              Trending Now
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Most popular and viral stories from around the world
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip icon={<TrendingUp />} label="Hot Topics" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            <Chip icon={<Timeline />} label="Viral Stories" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {articles.map((article, index) => (
              <Grid item xs={12} sm={6} md={4} key={article.id || index}>
                <Box position="relative">
                  {index < 3 && (
                    <Chip
                      label={`#${index + 1} Trending`}
                      color="error"
                      size="small"
                      sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1, fontWeight: 600 }}
                    />
                  )}
                  <ArticleCard article={article} showCategory showSource />
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
    </Box>
  );
};

export default Trending;