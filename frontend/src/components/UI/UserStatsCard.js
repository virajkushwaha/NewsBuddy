import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Avatar,
  Chip
} from '@mui/material';
import {
  Person,
  Bookmark,
  Visibility,
  TrendingUp
} from '@mui/icons-material';

const UserStatsCard = ({ 
  user, 
  preferences, 
  stats = { 
    articlesRead: 0, 
    bookmarks: 0, 
    readingTime: 0 
  } 
}) => {
  const formatReadingTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Welcome back, {user?.username || 'User'}!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Your personalized news feed is ready
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                <Visibility sx={{ fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {stats.articlesRead}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Articles Read
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                <Bookmark sx={{ fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {stats.bookmarks}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Bookmarks
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                <TrendingUp sx={{ fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {formatReadingTime(stats.readingTime)}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                Reading Time
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {preferences && (
          <Box mt={2}>
            <Typography variant="subtitle2" sx={{ mb: 1, opacity: 0.9 }}>
              Your Interests:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {preferences.categories?.slice(0, 3).map(category => (
                <Chip
                  key={category}
                  label={category}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    '& .MuiChip-deleteIcon': { color: 'white' }
                  }}
                />
              ))}
              {preferences.categories?.length > 3 && (
                <Chip
                  label={`+${preferences.categories.length - 3} more`}
                  size="small"
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    color: 'white' 
                  }}
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default UserStatsCard;