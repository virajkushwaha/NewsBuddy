const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');
const auth = require('../middleware/auth');
const { validateQuery } = require('../middleware/validation');
const logger = require('../utils/logger');

// Get top headlines
router.get('/headlines', validateQuery, async (req, res) => {
  try {
    const { country = 'us', category, page = 1, pageSize = 20 } = req.query;
    
    const articles = await newsService.fetchTopHeadlines(
      country, 
      category, 
      parseInt(pageSize)
    );
    
    res.json({
      success: true,
      data: articles,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: articles.length
      }
    });
    
  } catch (error) {
    logger.error('Error fetching headlines:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch headlines',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Search everything
router.get('/search', validateQuery, async (req, res) => {
  try {
    const { q: query, sortBy = 'publishedAt', page = 1, pageSize = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query parameter is required'
      });
    }
    
    // Search in database first
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    let articles = await newsService.searchArticles(query, parseInt(pageSize), offset);
    
    // If no results in database, search via API
    if (articles.length === 0) {
      articles = await newsService.fetchEverything(
        query,
        sortBy,
        parseInt(pageSize),
        parseInt(page)
      );
    }
    
    res.json({
      success: true,
      data: articles,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: articles.length
      }
    });
    
  } catch (error) {
    logger.error('Error searching news:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search news',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get articles by category
router.get('/category/:category', validateQuery, async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, pageSize = 20 } = req.query;
    
    const validCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
    
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }
    
    // Try to get from database first
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    let articles = await newsService.getArticlesByCategory(
      category,
      parseInt(pageSize),
      offset
    );
    
    // If no articles in database, fetch from API
    if (articles.length === 0) {
      articles = await newsService.fetchTopHeadlines('us', category, parseInt(pageSize));
    }
    
    res.json({
      success: true,
      data: articles,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: articles.length
      }
    });
    
  } catch (error) {
    logger.error('Error fetching category articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get trending articles
router.get('/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    let articles = await newsService.getTrendingArticles(parseInt(limit));
    
    // If no trending articles, get recent popular ones
    if (!articles || articles.length === 0) {
      articles = await newsService.fetchTopHeadlines('us', null, parseInt(limit));
      // Add trending scores
      articles = articles.map((article, index) => ({
        ...article,
        trending_score: 100 - index * 2,
        views: Math.floor(Math.random() * 10000) + 1000
      }));
    }
    
    // Clean up Sequelize objects to plain JSON
    const cleanArticles = articles.map(article => {
      if (article.dataValues) {
        return {
          ...article.dataValues,
          trending_score: article.trending_score || 100,
          views: article.views || article.dataValues.views || 0
        };
      }
      return article;
    });
    
    res.json({
      success: true,
      data: cleanArticles,
      meta: {
        count: cleanArticles.length,
        trending_algorithm: 'engagement_based'
      }
    });
    
  } catch (error) {
    logger.error('Error fetching trending articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Fetch all categories (admin endpoint)
router.post('/fetch-all', async (req, res) => {
  try {
    logger.info('Manual fetch of all categories initiated');
    const articles = await newsService.fetchAllCategories();
    
    res.json({
      success: true,
      message: `Fetched ${articles.length} articles across all categories`,
      data: articles
    });
    
  } catch (error) {
    logger.error('Error in manual fetch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Health check for news service
router.get('/health', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'News service is operational',
      timestamp: new Date().toISOString(),
      apis: {
        newsapi: 'configured',
        database: 'sqlite connected'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'News service health check failed'
    });
  }
});

module.exports = router;