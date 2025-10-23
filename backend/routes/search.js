const express = require('express');
const router = express.Router();
const { validateSearchQuery } = require('../middleware/validation');
const searchService = require('../services/searchService');
const newsService = require('../services/newsService');
const logger = require('../utils/logger');

// Semantic search
router.get('/semantic', validateSearchQuery, async (req, res) => {
  try {
    const { query, page = 1, pageSize = 20 } = req.query;
    
    const results = await searchService.semanticSearch(
      query,
      parseInt(pageSize),
      (parseInt(page) - 1) * parseInt(pageSize)
    );

    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: results.length
      }
    });

  } catch (error) {
    logger.error('Semantic search error:', error);
    res.status(500).json({
      success: false,
      message: 'Semantic search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Traditional text search
router.get('/text', validateSearchQuery, async (req, res) => {
  try {
    const { query, page = 1, pageSize = 20 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(pageSize);
    const results = await newsService.searchArticles(
      query,
      parseInt(pageSize),
      skip
    );

    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: results.length
      }
    });

  } catch (error) {
    logger.error('Text search error:', error);
    res.status(500).json({
      success: false,
      message: 'Text search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Combined search (semantic + text)
router.get('/combined', validateSearchQuery, async (req, res) => {
  try {
    const { query, page = 1, pageSize = 20 } = req.query;
    
    // Run both searches in parallel
    const [semanticResults, textResults] = await Promise.all([
      searchService.semanticSearch(query, Math.ceil(parseInt(pageSize) / 2)),
      newsService.searchArticles(query, Math.ceil(parseInt(pageSize) / 2))
    ]);

    // Combine and deduplicate results
    const combinedResults = [...semanticResults];
    const existingUrls = new Set(semanticResults.map(article => article.url));
    
    textResults.forEach(article => {
      if (!existingUrls.has(article.url)) {
        combinedResults.push(article);
      }
    });

    // Sort by relevance and date
    combinedResults.sort((a, b) => {
      if (a.score && b.score) {
        return b.score - a.score;
      }
      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(pageSize);
    const paginatedResults = combinedResults.slice(startIndex, startIndex + parseInt(pageSize));

    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: combinedResults.length
      },
      meta: {
        semanticCount: semanticResults.length,
        textCount: textResults.length,
        combinedCount: combinedResults.length
      }
    });

  } catch (error) {
    logger.error('Combined search error:', error);
    res.status(500).json({
      success: false,
      message: 'Combined search failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Search suggestions/autocomplete
router.get('/suggestions', async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const suggestions = await searchService.getSearchSuggestions(query, parseInt(limit));

    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    logger.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get search suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;