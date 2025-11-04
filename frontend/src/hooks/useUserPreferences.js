import { useState, useEffect } from 'react';
import userService from '../services/userService';
import toast from 'react-hot-toast';

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState({
    categories: [],
    sources: [],
    keywords: [],
    language: 'en',
    country: 'us'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await userService.getPreferences();
      setPreferences(response.data || preferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      setSaving(true);
      const response = await userService.updatePreferences(newPreferences);
      setPreferences(response.data);
      toast.success('Preferences updated successfully!');
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const addCategory = (category) => {
    if (!preferences.categories.includes(category)) {
      const newPreferences = {
        ...preferences,
        categories: [...preferences.categories, category]
      };
      setPreferences(newPreferences);
      return newPreferences;
    }
    return preferences;
  };

  const removeCategory = (category) => {
    const newPreferences = {
      ...preferences,
      categories: preferences.categories.filter(c => c !== category)
    };
    setPreferences(newPreferences);
    return newPreferences;
  };

  const addKeyword = (keyword) => {
    if (keyword && !preferences.keywords.includes(keyword)) {
      const newPreferences = {
        ...preferences,
        keywords: [...preferences.keywords, keyword]
      };
      setPreferences(newPreferences);
      return newPreferences;
    }
    return preferences;
  };

  const removeKeyword = (keyword) => {
    const newPreferences = {
      ...preferences,
      keywords: preferences.keywords.filter(k => k !== keyword)
    };
    setPreferences(newPreferences);
    return newPreferences;
  };

  const setLanguage = (language) => {
    const newPreferences = { ...preferences, language };
    setPreferences(newPreferences);
    return newPreferences;
  };

  const setCountry = (country) => {
    const newPreferences = { ...preferences, country };
    setPreferences(newPreferences);
    return newPreferences;
  };

  return {
    preferences,
    loading,
    saving,
    updatePreferences,
    addCategory,
    removeCategory,
    addKeyword,
    removeKeyword,
    setLanguage,
    setCountry,
    reload: loadPreferences
  };
};

export default useUserPreferences;