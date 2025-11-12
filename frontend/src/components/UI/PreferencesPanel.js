import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  Button,
  Autocomplete
} from '@mui/material';
import { Save } from '@mui/icons-material';

const PreferencesPanel = ({ 
  preferences, 
  onSave, 
  saving = false,
  showSaveButton = true 
}) => {
  const [localPreferences, setLocalPreferences] = useState(preferences);

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

  const handleCategoryToggle = (category) => {
    const newCategories = localPreferences.categories.includes(category)
      ? localPreferences.categories.filter(c => c !== category)
      : [...localPreferences.categories, category];
    
    setLocalPreferences(prev => ({ ...prev, categories: newCategories }));
  };

  const handleKeywordAdd = (keyword) => {
    if (keyword && !localPreferences.keywords.includes(keyword)) {
      setLocalPreferences(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
    }
  };

  const handleKeywordRemove = (keyword) => {
    setLocalPreferences(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const handleSave = () => {
    onSave?.(localPreferences);
  };

  return (
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
              color={localPreferences.categories.includes(category) ? 'primary' : 'default'}
              variant={localPreferences.categories.includes(category) ? 'filled' : 'outlined'}
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
          {localPreferences.keywords.map(keyword => (
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
              value={localPreferences.language}
              onChange={(e) => setLocalPreferences(prev => ({ ...prev, language: e.target.value }))}
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
              value={localPreferences.country}
              onChange={(e) => setLocalPreferences(prev => ({ ...prev, country: e.target.value }))}
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

      {showSaveButton && (
        <Box mt={3}>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default PreferencesPanel;