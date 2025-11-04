import api from './api';

const newsService = {
  // Get top headlines
  async getHeadlines(params = {}) {
    const response = await api.get('/news/headlines', { params });
    return response.data;
  },

  // Search news
  async searchNews(query, params = {}) {
    const response = await api.get('/news/search', { 
      params: { q: query, ...params } 
    });
    return response.data;
  },

  // Get articles by category
  async getByCategory(category, params = {}) {
    const response = await api.get(`/news/category/${category}`, { params });
    return response.data;
  },

  // Get trending articles
  async getTrending(limit = 10) {
    console.log('Making trending API call with limit:', limit); // Debug log
    const response = await api.get('/news/trending', { 
      params: { limit } 
    });
    console.log('Trending API raw response:', response); // Debug log
    return response.data;
  },

  // Get article details
  async getArticle(id) {
    const response = await api.get(`/news/article/${id}`);
    return response.data;
  },

  // Like article
  async likeArticle(id) {
    const response = await api.post(`/news/article/${id}/like`);
    return response.data;
  },

  // Share article
  async shareArticle(id) {
    const response = await api.post(`/news/article/${id}/share`);
    return response.data;
  },

  // Get personalized recommendations
  async getRecommendations(limit = 20) {
    const response = await api.get('/recommendations', { 
      params: { limit } 
    });
    return response.data;
  },

  // Get similar articles
  async getSimilarArticles(articleId, limit = 5) {
    const response = await api.get(`/recommendations/similar/${articleId}`, { 
      params: { limit } 
    });
    return response.data;
  },

  // Send reading feedback
  async sendFeedback(articleId, action, rating = null, timeSpent = null) {
    const response = await api.post('/recommendations/feedback', {
      articleId,
      action,
      rating,
      timeSpent
    });
    return response.data;
  },

  // Search with different methods
  async semanticSearch(query, params = {}) {
    const response = await api.get('/search/semantic', { 
      params: { query, ...params } 
    });
    return response.data;
  },

  async textSearch(query, params = {}) {
    const response = await api.get('/search/text', { 
      params: { query, ...params } 
    });
    return response.data;
  },

  async combinedSearch(query, params = {}) {
    const response = await api.get('/search/combined', { 
      params: { query, ...params } 
    });
    return response.data;
  },

  // Get search suggestions
  async getSearchSuggestions(query, limit = 10) {
    const response = await api.get('/search/suggestions', { 
      params: { q: query, limit } 
    });
    return response.data;
  }
};

export default newsService;