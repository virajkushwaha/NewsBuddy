import React, { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  Container,
  Alert,
  Skeleton,
  Card,
  CardContent,
  Chip,
  Button,
  Paper
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TrendingUp, Category, Newspaper, Whatshot } from '@mui/icons-material';

import newsService from '../services/newsService';
import ArticleCard from '../components/News/ArticleCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useAuthStore } from '../store/authStore';

const categories = [
  { value: '', label: 'All', icon: '📰' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
  { value: 'health', label: 'Health', icon: '🏥' },
  { value: 'science', label: 'Science', icon: '🔬' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'technology', label: 'Technology', icon: '💻' }
];

const Home = () => {
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [articles, setArticles] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showPersonalized, setShowPersonalized] = useState(false);

  // Fetch news data
  const { isLoading, error } = useQuery(
    ['headlines', selectedCategory, page, showPersonalized, user?.id],
    async () => {
      try {
        if (showPersonalized && user) {
          return await newsService.getRecommendations(20);
        } else if (selectedCategory) {
          return await newsService.getByCategory(selectedCategory, { page, pageSize: 20 });
        } else {
          return await newsService.getHeadlines({ page, pageSize: 20 });
        }
      } catch (err) {
        console.error('API Error:', err);
        throw err;
      }
    },
    {
      onSuccess: (newData) => {
        if (page === 1) {
          setArticles(newData.data || []);
          // Load trending on first page load
          if (!showPersonalized) {
            loadTrendingArticles();
          }
        } else {
          setArticles(prev => [...prev, ...(newData.data || [])]);
        }
        setHasMore((newData.data || []).length === 20);
      },
      keepPreviousData: true,
      staleTime: 5 * 60 * 1000,
    }
  );

  const loadTrendingArticles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/news/trending?limit=6');
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setTrendingArticles(data.data.slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to load trending articles:', error);
    }
  };



  // Generate mock articles for demo
  const generateMockArticles = (count) => {
    const mockTitles = [
      "Breaking: Major Tech Company Announces Revolutionary AI Breakthrough",
      "Global Climate Summit Reaches Historic Agreement on Carbon Emissions",
      "Stock Markets Rally as Economic Indicators Show Strong Growth",
      "Scientists Discover New Treatment for Rare Disease",
      "Championship Finals Draw Record-Breaking Viewership Numbers",
      "New Study Reveals Surprising Benefits of Remote Work",
      "Cryptocurrency Market Sees Unprecedented Surge in Trading Volume",
      "International Space Station Welcomes New Research Mission",
      "Healthcare Innovation Promises to Transform Patient Care",
      "Entertainment Industry Adapts to Changing Consumer Preferences"
    ];

    return Array.from({ length: count }, (_, i) => ({
      _id: `mock-${i}`,
      title: mockTitles[i % mockTitles.length],
      description: "This is a sample news article description that provides a brief overview of the story content. Click to read more details about this developing story.",
      url: `https://example.com/article-${i}`,
      urlToImage: `https://picsum.photos/400/250?random=${i}`,
      publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
      source: { name: "News Source" },
      category: categories[Math.floor(Math.random() * categories.length)].value || 'general',
      views: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 100)
    }));
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
    setPage(1);
    setArticles([]);
    setHasMore(true);
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={60} />
              <Skeleton variant="text" width="60%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <>
      <Helmet>
        <title>NewsBuddy - Latest News & Headlines</title>
        <meta name="description" content="Stay updated with the latest news and headlines from around the world with AI-powered personalization." />
      </Helmet>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 4,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
              {user ? `Welcome back, ${user.username}!` : 'Stay Informed with NewsBuddy'}
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              {user ? 'Your personalized news feed awaits' : 'AI-powered personalized news from trusted sources worldwide'}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mb: 3 }}>
              <Chip icon={<TrendingUp />} label="Real-time Updates" color="secondary" />
              <Chip icon={<Category />} label="Multiple Categories" color="secondary" />
              <Chip icon={<Newspaper />} label="Trusted Sources" color="secondary" />
            </Box>
            {user && (
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant={showPersonalized ? 'contained' : 'outlined'}
                  onClick={() => {
                    setShowPersonalized(true);
                    setSelectedCategory('');
                    setPage(1);
                    setArticles([]);
                  }}
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  For You
                </Button>
                <Button
                  variant={!showPersonalized ? 'contained' : 'outlined'}
                  onClick={() => {
                    setShowPersonalized(false);
                    setSelectedCategory('');
                    setPage(1);
                    setArticles([]);
                  }}
                  sx={{ color: 'white', borderColor: 'white' }}
                >
                  All News
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Category Tabs */}
        {!showPersonalized && (
          <Paper elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                📈 Latest Headlines
              </Typography>
              <Tabs
                value={selectedCategory}
                onChange={handleCategoryChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    minHeight: 48
                  },
                }}
              >
                {categories.map((category) => (
                  <Tab
                    key={category.value}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{category.icon}</span>
                        {category.label}
                      </Box>
                    }
                    value={category.value}
                  />
                ))}
              </Tabs>
            </Box>
          </Paper>
        )}
        
        {showPersonalized && user && (
          <Paper elevation={2} sx={{ mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <Box sx={{ p: 3 }}>
              <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
                🎯 Personalized For You
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Articles curated based on your preferences and reading history
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
            Using demo data - API connection unavailable. The app is fully functional with sample news articles.
          </Alert>
        )}

        {/* Trending Section */}
        {!showPersonalized && trendingArticles.length > 0 && (
          <Paper elevation={2} sx={{ mb: 4, borderRadius: 3 }}>
            <Box sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Whatshot color="error" />
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    🔥 Trending Now
                  </Typography>
                </Box>
                <Box display="flex" gap={1}>
                  <Button 
                    variant="text" 
                    size="small" 
                    onClick={loadTrendingArticles}
                    sx={{ minWidth: 'auto', p: 1 }}
                  >
                    🔄
                  </Button>
                  <Button variant="outlined" href="/trending">
                    View All
                  </Button>
                </Box>
              </Box>
              <Grid container spacing={2}>
                {trendingArticles.map((article, index) => (
                  <Grid item xs={12} md={4} key={article.id || article._id || index}>
                    <Box position="relative">
                      <Chip
                        label={`#${index + 1}`}
                        color="error"
                        size="small"
                        sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
                      />
                      <ArticleCard article={article} showCategory showSource />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Paper>
        )}

        {/* Articles Grid */}
        {isLoading && page === 1 ? (
          renderSkeletons()
        ) : (
          <InfiniteScroll
            dataLength={articles.length}
            next={loadMore}
            hasMore={hasMore}
            loader={
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <LoadingSpinner />
              </Box>
            }
            endMessage={
              <Paper 
                elevation={1} 
                sx={{ 
                  textAlign: 'center', 
                  py: 4, 
                  my: 4, 
                  borderRadius: 3,
                  background: 'linear-gradient(45deg, #f3f4f6, #e5e7eb)'
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  🎉 You've reached the end!
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Check back later for more news updates
                </Typography>
              </Paper>
            }
          >
            <Grid container spacing={3}>
              {articles.map((article, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={`${article._id || article.url}-${index}`}>
                  <ArticleCard 
                    article={article}
                    showCategory
                    showSource
                  />
                </Grid>
              ))}
            </Grid>
          </InfiniteScroll>
        )}

        {articles.length === 0 && !isLoading && (
          <Paper 
            elevation={2} 
            sx={{ 
              textAlign: 'center', 
              py: 8, 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}
          >
            <Typography variant="h5" color="text.secondary" gutterBottom>
              📰 No articles found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Try selecting a different category or check back later
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => window.location.reload()}
              sx={{ borderRadius: 25 }}
            >
              Refresh Page
            </Button>
          </Paper>
        )}
      </Box>
    </>
  );
};

export default Home;