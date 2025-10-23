const axios = require('axios');
const logger = require('../utils/logger');
const Article = require('../models/Article');

class NewsService {
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.newsApiUrl = 'https://newsapi.org/v2';
  }

  async fetchTopHeadlines(country = 'us', category = null, pageSize = 20) {
    try {
      const params = {
        apiKey: this.newsApiKey,
        country,
        pageSize
      };
      
      if (category) {
        params.category = category;
      }

      const response = await axios.get(`${this.newsApiUrl}/top-headlines`, {
        params,
        timeout: 10000
      });

      if (response.data.status === 'ok') {
        return await this.processAndSaveArticles(response.data.articles, 'newsapi');
      } else {
        throw new Error(`NewsAPI error: ${response.data.message}`);
      }
    } catch (error) {
      logger.error('Error fetching top headlines:', error.message);
      throw error;
    }
  }

  async fetchEverything(query, sortBy = 'publishedAt', pageSize = 20, page = 1) {
    try {
      const response = await axios.get(`${this.newsApiUrl}/everything`, {
        params: {
          apiKey: this.newsApiKey,
          q: query,
          sortBy,
          pageSize,
          page
        },
        timeout: 10000
      });

      if (response.data.status === 'ok') {
        return await this.processAndSaveArticles(response.data.articles, 'newsapi');
      } else {
        throw new Error(`NewsAPI error: ${response.data.message}`);
      }
    } catch (error) {
      logger.error('Error fetching everything:', error.message);
      throw error;
    }
  }

  async fetchAllCategories() {
    const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
    const allArticles = [];

    for (const category of categories) {
      try {
        logger.info(`Fetching ${category} articles...`);
        const articles = await this.fetchTopHeadlines('us', category, 10);
        allArticles.push(...articles);
        
        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error(`Error fetching ${category} articles:`, error.message);
      }
    }

    return allArticles;
  }

  async processAndSaveArticles(articles, apiSource) {
    const processedArticles = [];
    
    for (const articleData of articles) {
      try {
        if (!articleData.title || !articleData.url) continue;

        // Check if article already exists
        const existingArticle = await Article.findOne({ 
          where: { url: articleData.url } 
        });
        
        if (existingArticle) {
          processedArticles.push(existingArticle);
          continue;
        }

        // Determine category from content if not provided
        const category = this.determineCategory(articleData.title, articleData.description);

        // Create new article
        const article = await Article.create({
          title: articleData.title,
          description: articleData.description,
          content: articleData.content,
          url: articleData.url,
          urlToImage: articleData.urlToImage,
          publishedAt: new Date(articleData.publishedAt),
          source: articleData.source,
          author: articleData.author,
          category: category,
          apiSource: apiSource,
          views: Math.floor(Math.random() * 100),
          likes: Math.floor(Math.random() * 20)
        });

        processedArticles.push(article);
        
      } catch (error) {
        logger.error(`Error processing article: ${error.message}`);
        continue;
      }
    }

    logger.info(`Processed ${processedArticles.length} articles from ${apiSource}`);
    return processedArticles;
  }

  determineCategory(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    
    const categoryKeywords = {
      business: ['business', 'economy', 'market', 'stock', 'finance', 'company', 'corporate', 'trade', 'investment'],
      technology: ['tech', 'technology', 'software', 'ai', 'computer', 'digital', 'internet', 'app', 'startup'],
      sports: ['sport', 'football', 'basketball', 'soccer', 'baseball', 'tennis', 'olympic', 'championship', 'game'],
      health: ['health', 'medical', 'doctor', 'hospital', 'disease', 'treatment', 'medicine', 'covid', 'vaccine'],
      science: ['science', 'research', 'study', 'scientist', 'discovery', 'space', 'climate', 'environment'],
      entertainment: ['movie', 'film', 'music', 'celebrity', 'entertainment', 'actor', 'singer', 'show', 'tv']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return category;
      }
    }

    return 'general';
  }

  async getArticlesByCategory(category, limit = 20, offset = 0) {
    try {
      return await Article.findAll({
        where: { category },
        order: [['publishedAt', 'DESC']],
        limit,
        offset
      });
    } catch (error) {
      logger.error('Error fetching articles by category:', error);
      throw error;
    }
  }

  async getTrendingArticles(limit = 10) {
    try {
      const { Op } = require('sequelize');
      return await Article.findAll({
        where: {
          publishedAt: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        },
        order: [['views', 'DESC'], ['likes', 'DESC'], ['publishedAt', 'DESC']],
        limit
      });
    } catch (error) {
      logger.error('Error fetching trending articles:', error);
      throw error;
    }
  }

  async searchArticles(query, limit = 20, offset = 0) {
    try {
      const { Op } = require('sequelize');
      return await Article.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.like]: `%${query}%` } },
            { description: { [Op.like]: `%${query}%` } }
          ]
        },
        order: [['publishedAt', 'DESC']],
        limit,
        offset
      });
    } catch (error) {
      logger.error('Error searching articles:', error);
      throw error;
    }
  }
}

module.exports = new NewsService();