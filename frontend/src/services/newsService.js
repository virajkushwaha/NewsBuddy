import api from './api';

// Demo data fallback
const demoArticles = [
  {
    id: '1',
    title: 'Breaking: Major Tech Company Announces Revolutionary AI Breakthrough',
    description: 'A leading technology company has unveiled a groundbreaking artificial intelligence system that promises to transform multiple industries.',
    url: '#',
    urlToImage: 'https://via.placeholder.com/800x400/0066cc/ffffff?text=Tech+News',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: { name: 'Tech News Daily' },
    author: 'Sarah Johnson',
    category: 'technology',
    views: 1250,
    likes: 45
  },
  {
    id: '2',
    title: 'Global Markets Show Strong Recovery Amid Economic Optimism',
    description: 'Stock markets worldwide are experiencing significant gains as investors show renewed confidence in economic recovery.',
    url: '#',
    urlToImage: 'https://via.placeholder.com/800x400/009900/ffffff?text=Business+News',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    source: { name: 'Business Wire' },
    author: 'Michael Chen',
    category: 'business',
    views: 890,
    likes: 32
  },
  {
    id: '3',
    title: 'Championship Finals Set as Teams Prepare for Epic Showdown',
    description: 'Two powerhouse teams will face off in what promises to be the most exciting championship final in recent history.',
    url: '#',
    urlToImage: 'https://via.placeholder.com/800x400/ff6600/ffffff?text=Sports+News',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    source: { name: 'Sports Center' },
    author: 'David Rodriguez',
    category: 'sports',
    views: 2100,
    likes: 78
  }
];

const newsService = {
  // Get top headlines
  async getHeadlines(params = {}) {
    try {
      const response = await api.get('/news/headlines', { params });
      return response.data;
    } catch (error) {
      console.warn('Headlines API unavailable, using demo data:', error.message);
      return {
        success: true,
        data: demoArticles,
        source: 'demo',
        message: 'Using demo data - API connection unavailable. The app is fully functional with sample news articles.'
      };
    }
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
    try {
      const response = await api.get(`/news/category/${category}`, { params });
      return response.data;
    } catch (error) {
      console.warn('Category API unavailable, using demo data:', error.message);
      const filteredArticles = category === 'general' ? demoArticles : 
        demoArticles.filter(article => article.category === category);
      return {
        success: true,
        data: filteredArticles,
        source: 'demo',
        message: 'Using demo data - API connection unavailable. The app is fully functional with sample news articles.'
      };
    }
  },

  // Get trending articles
  async getTrending(limit = 10) {
    try {
      console.log('Making trending API call with limit:', limit);
      const response = await api.get('/news/trending', { 
        params: { limit } 
      });
      console.log('Trending API response:', response.data);
      return response.data;
    } catch (error) {
      console.warn('API unavailable, using demo data:', error.message);
      return {
        success: true,
        data: demoArticles.slice(0, limit),
        source: 'demo',
        message: 'Using demo data - API connection unavailable. The app is fully functional with sample news articles.'
      };
    }
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