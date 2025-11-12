const axios = require('axios');
const logger = require('../utils/logger');
const Article = require('../models/Article');
const mockArticles = require('../data/mockNews');
const redis = require('redis');

class NewsService {
  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY;
    this.newsDataApiKey = process.env.NEWSDATA_API_KEY;
    this.newsApiUrl = 'https://newsapi.org/v2';
    this.newsDataUrl = 'https://newsdata.io/api/1';
    this.redisClient = null;
    this.initRedis();
  }

  async initRedis() {
    try {
      this.redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      });
      await this.redisClient.connect();
      logger.info('Redis connected successfully');
    } catch (error) {
      logger.error('Redis connection failed:', error.message);
    }
  }

  async fetchTopHeadlines(country = 'us', category = null, pageSize = 20) {
    const cacheKey = `headlines:${country}:${category}:${pageSize}`;
    
    try {
      // Check cache first
      if (this.redisClient) {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          logger.info('Returning cached headlines');
          return JSON.parse(cached);
        }
      }

      // Try NewsAPI first
      let articles = await this.tryNewsAPI(country, category, pageSize);
      
      // If NewsAPI fails, try NewsData.io
      if (!articles) {
        articles = await this.tryNewsDataIO(country, category, pageSize);
      }
      
      // If both APIs fail, use mock data
      if (!articles) {
        logger.warn('Both APIs failed, using mock data');
        articles = await this.getMockArticles(category, pageSize);
      }

      // Cache the result
      if (this.redisClient && articles) {
        await this.redisClient.setEx(cacheKey, 300, JSON.stringify(articles)); // 5 min cache
      }

      return articles;
    } catch (error) {
      logger.error('Error in fetchTopHeadlines:', error.message);
      return await this.getMockArticles(category, pageSize);
    }
  }

  async tryNewsAPI(country, category, pageSize) {
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
      }
      return null;
    } catch (error) {
      logger.warn('NewsAPI failed:', error.message);
      return null;
    }
  }

  async tryNewsDataIO(country, category, pageSize) {
    try {
      const params = {
        apikey: this.newsDataApiKey,
        country,
        size: pageSize
      };
      
      if (category) {
        params.category = category;
      }

      const response = await axios.get(`${this.newsDataUrl}/news`, {
        params,
        timeout: 10000
      });

      if (response.data.status === 'success') {
        return await this.processNewsDataArticles(response.data.results);
      }
      return null;
    } catch (error) {
      logger.warn('NewsData.io failed:', error.message);
      return null;
    }
  }

  async processNewsDataArticles(articles) {
    const processedArticles = [];
    
    for (const articleData of articles) {
      try {
        if (!articleData.title || !articleData.link) continue;

        const article = {
          title: articleData.title,
          description: articleData.description,
          content: articleData.content,
          url: articleData.link,
          urlToImage: articleData.image_url,
          publishedAt: new Date(articleData.pubDate),
          source: { name: articleData.source_id },
          author: articleData.creator?.[0] || 'Unknown',
          category: articleData.category?.[0] || 'general',
          apiSource: 'newsdata',
          views: Math.floor(Math.random() * 100),
          likes: Math.floor(Math.random() * 20)
        };

        processedArticles.push(article);
      } catch (error) {
        logger.error(`Error processing NewsData article: ${error.message}`);
        continue;
      }
    }

    return processedArticles;
  }

  async getMockArticles(category = null, limit = 20) {
    let articles = [...mockArticles];
    
    if (category && category !== 'general') {
      articles = articles.filter(article => article.category === category);
    }
    
    return articles.slice(0, limit).map(article => ({
      ...article,
      id: Math.random().toString(36).substr(2, 9),
      publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      views: Math.floor(Math.random() * 500),
      likes: Math.floor(Math.random() * 50)
    }));
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
    const cacheKey = 'all_categories';
    
    try {
      // Check cache first
      if (this.redisClient) {
        const cached = await this.redisClient.get(cacheKey);
        if (cached) {
          logger.info('Returning cached all categories');
          return JSON.parse(cached);
        }
      }

      const categories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'];
      const allArticles = [];

      // Use mock data to avoid rate limits
      for (const category of categories) {
        try {
          const articles = await this.getMockArticles(category, 5);
          allArticles.push(...articles);
        } catch (error) {
          logger.error(`Error fetching ${category} articles:`, error.message);
        }
      }

      // Cache the result
      if (this.redisClient) {
        await this.redisClient.setEx(cacheKey, 600, JSON.stringify(allArticles)); // 10 min cache
      }

      return allArticles;
    } catch (error) {
      logger.error('Error in fetchAllCategories:', error.message);
      return await this.getMockArticles(null, 35);
    }
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