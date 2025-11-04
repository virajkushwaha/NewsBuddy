import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  CircularProgress,
  Autocomplete
} from '@mui/material';
import { Save, Person, Settings, Bookmark, History } from '@mui/icons-material';
import userService from '../services/userService';
import toast from 'react-hot-toast';

const Profile = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({});
  const [preferences, setPreferences] = useState({
    categories: [],
    sources: [],
    keywords: [],
    language: 'en',
    country: 'us'
  });
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      breaking: true
    },
    privacy: {
      profilePublic: false,
      showReadingHistory: false
    }
  });
  const [bookmarks, setBookmarks] = useState([]);
  const [readingHistory, setReadingHistory] = useState([]);

  const categories = [
    'business', 'entertainment', 'general', 'health', 
    'science', 'sports', 'technology'
  ];

  const countries = [
    { code: 'us', name: 'United States' },
    { code: 'gb', name: 'United Kingdom' },
    { code: 'ca', name: 'Canada' },
    { code: 'au', name: 'Australia' },
    { code: 'in', name: 'India' },
    { code: 'de', name: 'Germany' },
    { code: 'fr', name: 'France' },
    { code: 'jp', name: 'Japan' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [profileRes, prefsRes, settingsRes, bookmarksRes, historyRes] = await Promise.all([
        userService.getProfile(),
        userService.getPreferences(),
        userService.getSettings(),
        userService.getBookmarks(),
        userService.getReadingHistory()
      ]);

      setProfile(profileRes.data || {});
      setPreferences(prefsRes.data || preferences);
      setSettings(settingsRes.data || settings);
      setBookmarks(bookmarksRes.data || []);
      setReadingHistory(historyRes.data || []);
    } catch (error) {
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      await userService.updatePreferences(preferences);
      toast.success('Preferences saved successfully!');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await userService.updateSettings(settings);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryToggle = (category) => {
    setPreferences(prev => ({
      ...prev,
      categories: (prev.categories || []).includes(category)
        ? (prev.categories || []).filter(c => c !== category)
        : [...(prev.categories || []), category]
    }));
  };

  const handleKeywordAdd = (keyword) => {
    if (keyword && !(preferences.keywords || []).includes(keyword)) {
      setPreferences(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), keyword]
      }));
    }
  };

  const handleKeywordRemove = (keyword) => {
    setPreferences(prev => ({
      ...prev,
      keywords: (prev.keywords || []).filter(k => k !== keyword)
    }));
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab icon={<Person />} label="Profile" />
          <Tab icon={<Settings />} label="Preferences" />
          <Tab icon={<Settings />} label="Settings" />
          <Tab icon={<Bookmark />} label="Bookmarks" />
          <Tab icon={<History />} label="Reading History" />
        </Tabs>

        <Box p={3}>
          {/* Profile Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Display Name"
                    value={profile.displayName || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Bio"
                    multiline
                    rows={3}
                    value={profile.bio || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Preferences Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                News Preferences
              </Typography>
              
              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Preferred Categories
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {categories.map(category => (
                    <Chip
                      key={category}
                      label={category}
                      onClick={() => handleCategoryToggle(category)}
                      color={(preferences.categories || []).includes(category) ? 'primary' : 'default'}
                      variant={(preferences.categories || []).includes(category) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Box>
              </Box>

              <Box mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  Keywords
                </Typography>
                <Autocomplete
                  freeSolo
                  options={[]}
                  value={null}
                  onChange={(e, value) => value && handleKeywordAdd(value)}
                  onInputChange={(e, value) => {
                    if (e?.type === 'keydown' && e.key === 'Enter') {
                      handleKeywordAdd(value);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Add keywords"
                      placeholder="Type and press Enter"
                    />
                  )}
                />
                <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                  {(preferences.keywords || []).map(keyword => (
                    <Chip
                      key={keyword}
                      label={keyword}
                      onDelete={() => handleKeywordRemove(keyword)}
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={preferences.language}
                      onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                    >
                      {languages.map(lang => (
                        <MenuItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Country</InputLabel>
                    <Select
                      value={preferences.country}
                      onChange={(e) => setPreferences(prev => ({ ...prev, country: e.target.value }))}
                    >
                      {countries.map(country => (
                        <MenuItem key={country.code} value={country.code}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box mt={3}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSavePreferences}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Settings Tab */}
          {activeTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Application Settings
              </Typography>
              
              <Box mb={3}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.theme}
                    onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value }))}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Notifications
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.email}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: e.target.checked }
                    }))}
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.push}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: e.target.checked }
                    }))}
                  />
                }
                label="Push Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.breaking}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      notifications: { ...prev.notifications, breaking: e.target.checked }
                    }))}
                  />
                }
                label="Breaking News Alerts"
              />

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                Privacy
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy.profilePublic}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, profilePublic: e.target.checked }
                    }))}
                  />
                }
                label="Public Profile"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy.showReadingHistory}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      privacy: { ...prev.privacy, showReadingHistory: e.target.checked }
                    }))}
                  />
                }
                label="Show Reading History"
              />

              <Box mt={3}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </Box>
            </Box>
          )}

          {/* Bookmarks Tab */}
          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Bookmarked Articles ({bookmarks.length})
              </Typography>
              {bookmarks.length === 0 ? (
                <Alert severity="info">No bookmarks yet. Start bookmarking articles you want to read later!</Alert>
              ) : (
                <Box>
                  {bookmarks.map((bookmark, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1">{bookmark.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Saved on {new Date(bookmark.savedAt).toLocaleDateString()}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Reading History Tab */}
          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Reading History ({readingHistory.length})
              </Typography>
              {readingHistory.length === 0 ? (
                <Alert severity="info">No reading history yet. Start reading articles to see your history here!</Alert>
              ) : (
                <Box>
                  {readingHistory.map((item, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle1">{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Read on {new Date(item.readAt).toLocaleDateString()}
                        {item.rating && ` • Rating: ${item.rating}/5`}
                        {item.timeSpent && ` • Time spent: ${Math.round(item.timeSpent / 60)}m`}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;