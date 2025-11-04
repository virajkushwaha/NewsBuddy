import api from './api';

const userService = {
  // Get user profile
  async getProfile() {
    const response = await api.get('/user/profile');
    return response.data;
  },

  // Update user profile
  async updateProfile(profileData) {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  },

  // Get user preferences
  async getPreferences() {
    const response = await api.get('/user/preferences');
    return response.data;
  },

  // Update user preferences
  async updatePreferences(preferences) {
    const response = await api.put('/user/preferences', preferences);
    return response.data;
  },

  // Get user settings
  async getSettings() {
    const response = await api.get('/user/settings');
    return response.data;
  },

  // Update user settings
  async updateSettings(settings) {
    const response = await api.put('/user/settings', settings);
    return response.data;
  },

  // Get reading history
  async getReadingHistory(page = 1, pageSize = 20) {
    const response = await api.get('/user/reading-history', {
      params: { page, pageSize }
    });
    return response.data;
  },

  // Get bookmarks
  async getBookmarks(page = 1, pageSize = 20) {
    const response = await api.get('/user/bookmarks', {
      params: { page, pageSize }
    });
    return response.data;
  },

  // Add bookmark
  async addBookmark(articleId) {
    const response = await api.post('/user/bookmarks', { articleId });
    return response.data;
  },

  // Remove bookmark
  async removeBookmark(articleId) {
    const response = await api.delete(`/user/bookmarks/${articleId}`);
    return response.data;
  }
};

export default userService;