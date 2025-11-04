const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validatePreferences, validateSettings, validateProfile } = require('../middleware/validation');
const User = require('../models/User');
const Article = require('../models/Article');
const logger = require('../utils/logger');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    logger.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user profile
router.put('/profile', auth, validateProfile, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update profile fields
    user.profile = { ...user.profile, ...req.body };
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.profile
    });

  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['preferences']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.preferences
    });

  } catch (error) {
    logger.error('Error getting user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user preferences
router.put('/preferences', auth, validatePreferences, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update preferences
    user.preferences = { ...user.preferences, ...req.body };
    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });

  } catch (error) {
    logger.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get user settings
router.get('/settings', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['settings']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.settings
    });

  } catch (error) {
    logger.error('Error getting user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update user settings
router.put('/settings', auth, validateSettings, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update settings
    user.settings = { ...user.settings, ...req.body };
    await user.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: user.settings
    });

  } catch (error) {
    logger.error('Error updating user settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get reading history
router.get('/reading-history', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const user = await User.findByPk(req.userId, {
      attributes: ['readingHistory']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Sort by read date (most recent first)
    const sortedHistory = user.readingHistory.sort((a, b) => 
      new Date(b.readAt) - new Date(a.readAt)
    );

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
    const paginatedHistory = sortedHistory.slice(startIndex, startIndex + parseInt(pageSize));

    res.json({
      success: true,
      data: paginatedHistory,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: sortedHistory.length
      }
    });

  } catch (error) {
    logger.error('Error getting reading history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get reading history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add to bookmarks
router.post('/bookmarks', auth, async (req, res) => {
  try {
    const { articleId } = req.body;
    
    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: 'Article ID is required'
      });
    }

    const user = await User.findByPk(req.userId);
    const article = await Article.findByPk(articleId);
    
    if (!user || !article) {
      return res.status(404).json({
        success: false,
        message: 'User or article not found'
      });
    }

    // Check if already bookmarked
    const existingBookmark = user.bookmarks.find(
      bookmark => bookmark.articleId === articleId
    );

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: 'Article already bookmarked'
      });
    }

    // Add to bookmarks
    user.bookmarks.push({
      articleId,
      title: article.title,
      url: article.url
    });

    await user.save();

    res.json({
      success: true,
      message: 'Article bookmarked successfully'
    });

  } catch (error) {
    logger.error('Error adding bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add bookmark',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get bookmarks
router.get('/bookmarks', auth, async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const user = await User.findByPk(req.userId, {
      attributes: ['bookmarks']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Sort by saved date (most recent first)
    const sortedBookmarks = user.bookmarks.sort((a, b) => 
      new Date(b.savedAt) - new Date(a.savedAt)
    );

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
    const paginatedBookmarks = sortedBookmarks.slice(startIndex, startIndex + parseInt(pageSize));

    res.json({
      success: true,
      data: paginatedBookmarks,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: sortedBookmarks.length
      }
    });

  } catch (error) {
    logger.error('Error getting bookmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookmarks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Remove bookmark
router.delete('/bookmarks/:articleId', auth, async (req, res) => {
  try {
    const { articleId } = req.params;
    const user = await User.findByPk(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove bookmark
    user.bookmarks = user.bookmarks.filter(
      bookmark => bookmark.articleId !== articleId
    );

    await user.save();

    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });

  } catch (error) {
    logger.error('Error removing bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove bookmark',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;