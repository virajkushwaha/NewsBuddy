import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { Person, TrendingUp, Favorite } from '@mui/icons-material';
import ArticleCard from '../components/News/ArticleCard';
import UserStatsCard from '../components/UI/UserStatsCard';
import newsService from '../services/newsService';
import userService from '../services/userService';
import { useAuthStore } from '../store/authStore';

const ForYou = () => {
  const { user } = useAuthStore();
  const [articles, setArticles] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({ articlesRead: 0, bookmarks: 0, readingTime: 0 });

  useEffect(() => {
    if (user) {
      setArticles(generatePersonalizedMockData());
      loadForYouContent();
      loadUserData();
    }
  }, [user]);

  const loadForYouContent = async () => {
    try {
      setLoading(true);
      const response = await newsService.getRecommendations(20);
      if (response.data && response.data.length > 0) {
        setArticles(response.data);
      }
    } catch (error) {
      console.error('Error loading personalized content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const [prefsRes, bookmarksRes, historyRes] = await Promise.all([
        userService.getPreferences(),
        userService.getBookmarks(),
        userService.getReadingHistory()
      ]);
      
      setPreferences(prefsRes.data);
      
      const bookmarks = bookmarksRes.data || [];
      const history = historyRes.data || [];
      const totalReadingTime = history.reduce((total, item) => total + (item.timeSpent || 0), 0);
      
      setUserStats({
        articlesRead: history.length,
        bookmarks: bookmarks.length,
        readingTime: Math.round(totalReadingTime / 60)
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const generatePersonalizedMockData = () => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: `foryou-${i}`,
      title: [
        '🎯 AI Breakthrough Matches Your Tech Interests',
        '🎯 Health Innovation You\'ll Want to Read',
        '🎯 Business Trends Aligned with Your Preferences',
        '🎯 Science Discovery Based on Your Reading History',
        '🎯 Technology Update Curated for You',
        '🎯 Personalized Health & Wellness News',
        '🎯 Custom Business Intelligence Report',
        '🎯 Tailored Science & Research Update',
        '🎯 Your Preferred Sports & Entertainment Mix',
        '🎯 Curated Technology & Innovation News',
        '🎯 Personalized Climate & Environment Update',
        '🎯 Custom Education & Learning Insights',
        '🎯 Your Interest-Based Financial News',
        '🎯 Tailored Lifestyle & Culture Stories',
        '🎯 Personalized Global Affairs Update'
      ][i],
      description: 'This article was specifically selected for you based on your reading preferences, interests, and engagement history.',
      url: `https://example.com/foryou-${i}`,
      urlToImage: `https://picsum.photos/400/250?random=${i + 500}`,
      publishedAt: new Date(Date.now() - i * 2400000).toISOString(),
      source: { name: `Personalized ${['Tech', 'Health', 'Business', 'Science'][i % 4]} Today` },
      category: ['technology', 'health', 'business', 'science'][i % 4],
      views: Math.floor(Math.random() * 12000) + 3000,
      personalization_score: 98 - i
    }));
  };

  if (!user) {
    return (
      <Container maxWidth="lg">
        <Paper sx={{ p: 6, textAlign: 'center', mt: 4 }}>
          <Person sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Sign In Required
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Please sign in to access your personalized "For You" news feed
          </Typography>
          <Button variant="contained" href="/login" size="large">
            Sign In
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Favorite sx={{ fontSize: 40 }} />
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              For You
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Personalized news curated just for you, {user.username}
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Chip icon={<Person />} label="Personalized" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            <Chip icon={<TrendingUp />} label="AI Curated" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          </Box>
        </Paper>

        <UserStatsCard user={user} preferences={preferences} stats={userStats} />

        {preferences && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              📊 Your News Preferences
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {(preferences.categories || []).map(category => (
                <Chip key={category} label={category} color="primary" size="small" />
              ))}
              {(preferences.keywords || []).map(keyword => (
                <Chip key={keyword} label={keyword} variant="outlined" size="small" />
              ))}
            </Box>
          </Paper>
        )}

        {loading && articles.length === 0 ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                🎯 Curated Just for You ({articles.length} articles)
              </Typography>
            </Box>
            <Grid container spacing={3}>
              {articles.map((article, index) => (
                <Grid item xs={12} sm={6} md={4} key={article.id || index}>
                  <Box position="relative">
                    {index < 5 && (
                      <Chip
                        label="Recommended"
                        color="success"
                        size="small"
                        sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
                      />
                    )}
                    <ArticleCard article={article} showCategory showSource />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </>
        )}
    </Container>
  );
};

export default ForYou;