import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Divider,
  Paper,
  Skeleton
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  Person
} from '@mui/icons-material';
import ArticleCard from '../components/News/ArticleCard';
import UserStatsCard from '../components/UI/UserStatsCard';
import newsService from '../services/newsService';
import userService from '../services/userService';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

const PersonalizedFeed = () => {
  const { user } = useAuthStore();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [bookmarkedArticles, setBookmarkedArticles] = useState(new Set());
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [userStats, setUserStats] = useState({ articlesRead: 0, bookmarks: 0, readingTime: 0 });

  useEffect(() => {
    // Show mock data immediately for better UX
    setArticles(generateMockPersonalizedArticles());
    loadPersonalizedFeed();
    loadUserPreferences();
    loadBookmarks();
    loadUserStats();
  }, []);

  const generateMockPersonalizedArticles = () => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: `personalized-${i}`,
      title: [
        'AI Technology Revolutionizes Healthcare Industry',
        'Climate Change Solutions Show Promising Results',
        'Tech Giants Invest Billions in Green Energy',
        'Medical Breakthrough Offers Hope for Rare Diseases',
        'Space Exploration Reaches New Milestones',
        'Renewable Energy Adoption Accelerates Globally',
        'Scientific Discovery Could Transform Medicine',
        'Innovation in Education Technology Grows',
        'Sustainable Agriculture Methods Gain Traction',
        'Digital Health Solutions Improve Patient Care',
        'Clean Technology Investments Surge Worldwide',
        'Research Breakthrough in Cancer Treatment'
      ][i],
      description: 'Personalized content based on your interests and reading history. This article covers the latest developments...',
      url: `https://example.com/personalized-${i}`,
      urlToImage: `https://picsum.photos/400/250?random=${i + 400}`,
      publishedAt: new Date(Date.now() - i * 1800000).toISOString(),
      source: { name: `Personalized Source ${i % 4 + 1}` },
      category: ['technology', 'science', 'health', 'business'][i % 4],
      views: Math.floor(Math.random() * 8000) + 2000,
      relevance_score: 95 - i * 2
    }));
  };

  const loadPersonalizedFeed = async () => {
    try {
      setLoading(true);
      const response = await newsService.getRecommendations(20);
      setArticles(response.data || []);
    } catch (error) {
      console.error('Error loading personalized feed:', error);
      // Fallback to trending articles if personalized feed fails
      try {
        const fallbackResponse = await newsService.getTrending(20);
        setArticles(fallbackResponse.data || []);
        toast.error('Personalized feed unavailable, showing trending articles');
      } catch (fallbackError) {
        toast.error('Failed to load articles');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const response = await userService.getPreferences();
      setPreferences(response.data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const loadBookmarks = async () => {
    try {
      const response = await userService.getBookmarks();
      const bookmarkIds = new Set(response.data.map(b => b.articleId));
      setBookmarkedArticles(bookmarkIds);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const [bookmarksRes, historyRes] = await Promise.all([
        userService.getBookmarks(),
        userService.getReadingHistory()
      ]);
      
      const bookmarks = bookmarksRes.data || [];
      const history = historyRes.data || [];
      
      const totalReadingTime = history.reduce((total, item) => {
        return total + (item.timeSpent || 0);
      }, 0);
      
      setUserStats({
        articlesRead: history.length,
        bookmarks: bookmarks.length,
        readingTime: Math.round(totalReadingTime / 60) // Convert to minutes
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPersonalizedFeed();
    setRefreshing(false);
    toast.success('Feed refreshed!');
  };

  const handleBookmark = async (articleId) => {
    try {
      if (bookmarkedArticles.has(articleId)) {
        await userService.removeBookmark(articleId);
        setBookmarkedArticles(prev => {
          const newSet = new Set(prev);
          newSet.delete(articleId);
          return newSet;
        });
        toast.success('Bookmark removed');
      } else {
        await userService.addBookmark(articleId);
        setBookmarkedArticles(prev => new Set([...prev, articleId]));
        toast.success('Article bookmarked');
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleFeedback = async (articleId, action, rating = null) => {
    try {
      await newsService.sendFeedback(articleId, action, rating);
      if (action === 'like') {
        toast.success('Thanks for your feedback!');
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
    }
  };

  const handleShare = async (article) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url
        });
      } else {
        await navigator.clipboard.writeText(article.url);
        toast.success('Link copied to clipboard!');
      }
      await newsService.sendFeedback(article.id, 'share');
    } catch (error) {
      console.error('Error sharing article:', error);
    }
  };

  const handleMenuOpen = (event, article) => {
    setAnchorEl(event.currentTarget);
    setSelectedArticle(article);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedArticle(null);
  };



  const LoadingSkeleton = () => (
    <Card>
      <Skeleton variant="rectangular" height={200} />
      <CardContent>
        <Skeleton variant="text" height={32} />
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" height={20} width="60%" />
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" gutterBottom>
          Your Personalized Feed
        </Typography>
        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          Refresh
        </Button>
      </Box>

      <UserStatsCard 
        user={user} 
        preferences={preferences} 
        stats={userStats} 
      />

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <LoadingSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : articles.length === 0 ? (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            No personalized articles available
          </Typography>
          <Typography variant="body2">
            Update your preferences in the Profile section to get better recommendations.
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => window.location.href = '/profile'}
          >
            Update Preferences
          </Button>
        </Alert>
      ) : (
        <>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <TrendingUp color="primary" />
            <Typography variant="h6">
              Recommended for You ({articles.length} articles)
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {articles.map((article, index) => (
              <Grid item xs={12} sm={6} md={4} key={article.id || index}>
                <ArticleCard 
                  article={article} 
                  showCategory={true}
                  showSource={true}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          handleFeedback(selectedArticle?.id, 'not_interested');
          handleMenuClose();
        }}>
          Not Interested
        </MenuItem>
        <MenuItem onClick={() => {
          handleFeedback(selectedArticle?.id, 'report');
          handleMenuClose();
        }}>
          Report Article
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          if (selectedArticle) {
            window.open(`/search?q=${selectedArticle.source?.name}`, '_blank');
          }
          handleMenuClose();
        }}>
          More from {selectedArticle?.source?.name}
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default PersonalizedFeed;