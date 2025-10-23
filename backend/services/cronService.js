const cron = require('node-cron');
const newsService = require('./newsService');
const mlService = require('./mlService');
const searchService = require('./searchService');
const logger = require('../utils/logger');

class CronService {
  constructor() {
    this.jobs = new Map();
  }

  start() {
    logger.info('Starting cron jobs...');

    // Fetch latest news every 15 minutes
    this.scheduleJob('fetchNews', '*/15 * * * *', async () => {
      try {
        logger.info('Fetching latest news from all categories...');
        await newsService.fetchAllCategories();
        logger.info('Latest news fetched successfully');
      } catch (error) {
        logger.error('Error fetching latest news:', error);
      }
    });

    // Update article embeddings every hour
    this.scheduleJob('updateEmbeddings', '0 * * * *', async () => {
      try {
        logger.info('Updating article embeddings...');
        const updated = await mlService.updateArticleEmbeddings();
        logger.info(`Updated embeddings for ${updated} articles`);
      } catch (error) {
        logger.error('Error updating embeddings:', error);
      }
    });

    // Index articles in OpenSearch every 30 minutes
    this.scheduleJob('indexArticles', '*/30 * * * *', async () => {
      try {
        logger.info('Indexing articles in OpenSearch...');
        const indexed = await searchService.indexAllArticles();
        logger.info(`Indexed ${indexed} articles`);
      } catch (error) {
        logger.error('Error indexing articles:', error);
      }
    });

    // Clean up old articles daily at 2 AM
    this.scheduleJob('cleanupOldArticles', '0 2 * * *', async () => {
      try {
        logger.info('Cleaning up old articles...');
        const Article = require('../models/Article');
        
        // Delete articles older than 30 days
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const { Op } = require('sequelize');
        const result = await Article.destroy({
          where: {
            publishedAt: {
              [Op.lt]: thirtyDaysAgo
            }
          }
        });
        
        logger.info(`Cleaned up ${result} old articles`);
      } catch (error) {
        logger.error('Error cleaning up old articles:', error);
      }
    });

    // Update trending articles every 5 minutes
    this.scheduleJob('updateTrending', '*/5 * * * *', async () => {
      try {
        logger.info('Updating trending articles...');
        // This could involve calculating trending scores based on views, likes, etc.
        // For now, we'll just log that it's running
        logger.info('Trending articles updated');
      } catch (error) {
        logger.error('Error updating trending articles:', error);
      }
    });

    // Generate daily analytics report at midnight
    this.scheduleJob('dailyAnalytics', '0 0 * * *', async () => {
      try {
        logger.info('Generating daily analytics...');
        await this.generateDailyAnalytics();
        logger.info('Daily analytics generated');
      } catch (error) {
        logger.error('Error generating daily analytics:', error);
      }
    });

    logger.info(`Started ${this.jobs.size} cron jobs`);
  }

  scheduleJob(name, schedule, task) {
    if (this.jobs.has(name)) {
      logger.warn(`Cron job ${name} already exists, skipping...`);
      return;
    }

    const job = cron.schedule(schedule, task, {
      scheduled: false,
      timezone: 'UTC'
    });

    job.start();
    this.jobs.set(name, job);
    logger.info(`Scheduled cron job: ${name} (${schedule})`);
  }

  stopJob(name) {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      logger.info(`Stopped cron job: ${name}`);
      return true;
    }
    return false;
  }

  stopAll() {
    logger.info('Stopping all cron jobs...');
    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info(`Stopped cron job: ${name}`);
    }
    this.jobs.clear();
    logger.info('All cron jobs stopped');
  }

  getJobStatus() {
    const status = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled
      };
    }
    return status;
  }

  async generateDailyAnalytics() {
    try {
      const Article = require('../models/Article');
      const User = require('../models/User');
      const { Op } = require('sequelize');
      const { sequelize } = require('../config/database');
      
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      // Get daily stats
      const [
        totalArticles,
        newArticles,
        totalUsers,
        activeUsers,
        topCategories
      ] = await Promise.all([
        Article.count(),
        Article.count({
          where: {
            createdAt: { [Op.gte]: yesterday }
          }
        }),
        User.count(),
        User.count({
          where: {
            lastLogin: { [Op.gte]: yesterday }
          }
        }),
        Article.findAll({
          attributes: [
            'category',
            [sequelize.fn('COUNT', '*'), 'count']
          ],
          where: {
            publishedAt: { [Op.gte]: yesterday }
          },
          group: ['category'],
          order: [[sequelize.literal('count'), 'DESC']],
          limit: 5
        })
      ]);

      const analytics = {
        date: today.toISOString().split('T')[0],
        totalArticles,
        newArticles,
        totalUsers,
        activeUsers,
        topCategories: topCategories.map(cat => ({
          category: cat.category,
          count: cat.dataValues.count
        }))
      };

      logger.info('Daily analytics:', analytics);
      
      // Here you could send this data to a monitoring service
      // or store it in a separate analytics collection
      
      return analytics;
    } catch (error) {
      logger.error('Error generating daily analytics:', error);
      throw error;
    }
  }
}

module.exports = new CronService();