const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mlService = require('../services/mlService');
const User = require('../models/User');
const logger = require('../utils/logger');

// Get personalized recommendations
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userPreferences = user.getMLPreferences();
    const recommendations = await mlService.getPersonalizedRecommendations(
      req.userId,
      userPreferences,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: recommendations,
      meta: {
        userId: req.userId,
        preferences: userPreferences,
        count: recommendations.length
      }
    });

  } catch (error) {
    logger.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get similar articles
router.get('/similar/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const { limit = 5 } = req.query;

    const similarArticles = await mlService.findSimilarArticles(
      articleId,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: similarArticles
    });

  } catch (error) {
    logger.error('Error getting similar articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get similar articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user reading behavior (for ML training)
router.post('/feedback', auth, async (req, res) => {
  try {
    const { articleId, action, rating, timeSpent } = req.body;
    
    if (!articleId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Article ID and action are required'
      });
    }

    const user = await User.findById(req.userId);
    const Article = require('../models/Article');
    const article = await Article.findById(articleId);

    if (!user || !article) {
      return res.status(404).json({
        success: false,
        message: 'User or article not found'
      });
    }

    // Update reading history
    const existingEntry = user.readingHistory.find(
      entry => entry.articleId === articleId
    );

    if (existingEntry) {
      existingEntry.rating = rating || existingEntry.rating;
      existingEntry.timeSpent = timeSpent || existingEntry.timeSpent;
    } else {
      user.readingHistory.push({
        articleId,
        title: article.title,
        url: article.url,
        rating,
        timeSpent
      });
    }

    // Keep only last 100 entries
    if (user.readingHistory.length > 100) {
      user.readingHistory = user.readingHistory.slice(-100);
    }

    await user.save();

    // Emit real-time update if socket is available
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.userId}`).emit('reading-update', {
        action,
        articleId,
        rating,
        timeSpent
      });
    }

    res.json({
      success: true,
      message: 'Feedback recorded successfully'
    });

  } catch (error) {
    logger.error('Error recording feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record feedback',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;