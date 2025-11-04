import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Paper,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Business,
  SportsEsports,
  Science,
  HealthAndSafety,
  Computer,
  Movie,
  Public
} from '@mui/icons-material';
import ArticleCard from '../components/News/ArticleCard';
import newsService from '../services/newsService';

const Categories = () => {
  const { category } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: 'business', name: 'Business', icon: <Business />, color: '#1976d2', emoji: '💼' },
    { id: 'technology', name: 'Technology', icon: <Computer />, color: '#9c27b0', emoji: '💻' },
    { id: 'science', name: 'Science', icon: <Science />, color: '#2e7d32', emoji: '🔬' },
    { id: 'health', name: 'Health', icon: <HealthAndSafety />, color: '#d32f2f', emoji: '🏥' },
    { id: 'sports', name: 'Sports', icon: <SportsEsports />, color: '#f57c00', emoji: '⚽' },
    { id: 'entertainment', name: 'Entertainment', icon: <Movie />, color: '#7b1fa2', emoji: '🎬' },
    { id: 'general', name: 'General', icon: <Public />, color: '#455a64', emoji: '📰' }
  ];

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryNews(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategoryNews = async (cat) => {
    try {
      setLoading(true);
      const response = await newsService.getByCategory(cat, { pageSize: 20 });
      setArticles(response.data && response.data.length > 0 ? response.data : generateMockCategoryNews(cat));
    } catch (error) {
      setArticles(generateMockCategoryNews(cat));
    } finally {
      setLoading(false);
    }
  };

  const generateMockCategoryNews = (cat) => {
    const categoryContent = {
      business: ['Market Rally Continues', 'Tech Stocks Surge', 'Economic Growth Report'],
      technology: ['AI Breakthrough', 'New Smartphone Launch', 'Cybersecurity Update'],
      science: ['Space Discovery', 'Climate Research', 'Medical Innovation'],
      health: ['Health Study Results', 'New Treatment Option', 'Wellness Tips'],
      sports: ['Championship Update', 'Player Transfer News', 'Olympic Preparation'],
      entertainment: ['Movie Release', 'Celebrity News', 'Award Show Results'],
      general: ['Breaking News', 'World Update', 'Local Story']
    };

    const titles = categoryContent[cat] || categoryContent.general;
    return Array.from({ length: 12 }, (_, i) => ({
      id: `${cat}-${i}`,
      title: `${titles[i % titles.length]} - ${cat.charAt(0).toUpperCase() + cat.slice(1)} News ${i + 1}`,
      description: `Latest ${cat} news with important updates and developments in the field...`,
      url: `https://example.com/${cat}-${i}`,
      urlToImage: `https://picsum.photos/400/250?random=${cat.length + i}`,
      publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
      source: { name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} Today` },
      category: cat,
      views: Math.floor(Math.random() * 5000) + 1000
    }));
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    window.history.pushState(null, '', `/categories/${cat}`);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            📂 News Categories
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Explore news by your favorite topics and interests
          </Typography>
        </Paper>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {categories.map((cat) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={cat.id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: selectedCategory === cat.id ? `3px solid ${cat.color}` : '1px solid #e0e0e0',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
                }}
                onClick={() => handleCategorySelect(cat.id)}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Box sx={{ fontSize: '2rem', mb: 1 }}>{cat.emoji}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: cat.color }}>
                    {cat.name}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {selectedCategory && (
          <Box>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <Chip
                label={categories.find(c => c.id === selectedCategory)?.name}
                color="primary"
                size="large"
                sx={{ fontSize: '1rem', fontWeight: 600 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Latest {categories.find(c => c.id === selectedCategory)?.name} News
              </Typography>
            </Box>

            {loading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <CircularProgress size={60} />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {articles.map((article, index) => (
                  <Grid item xs={12} sm={6} md={4} key={article.id || index}>
                    <ArticleCard article={article} showCategory showSource />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {!selectedCategory && (
          <Paper sx={{ p: 6, textAlign: 'center', background: '#f5f5f5' }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Select a category above to view news
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Choose from Business, Technology, Science, Health, Sports, Entertainment, or General news
            </Typography>
          </Paper>
        )}
    </Box>
  );
};

export default Categories;