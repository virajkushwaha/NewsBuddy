const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  content: {
    type: DataTypes.TEXT
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  urlToImage: {
    type: DataTypes.STRING
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  source: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  author: {
    type: DataTypes.STRING
  },
  category: {
    type: DataTypes.ENUM('business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'),
    defaultValue: 'general'
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en'
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'us'
  },
  embeddings: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  keywords: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  sentiment: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  apiSource: {
    type: DataTypes.ENUM('newsapi', 'newsdata'),
    allowNull: false
  },
  indexed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastIndexed: {
    type: DataTypes.DATE
  }
}, {
  indexes: [
    { fields: ['publishedAt'] },
    { fields: ['category', 'publishedAt'] },
    { fields: ['url'], unique: true }
  ]
});

// Indexes are defined in the model definition above

// Static method to find trending articles
Article.findTrending = function(limit = 10) {
  const { Op } = require('sequelize');
  return this.findAll({
    where: {
      publishedAt: {
        [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    },
    order: [['views', 'DESC'], ['likes', 'DESC'], ['publishedAt', 'DESC']],
    limit
  });
};

// Static method to find by category
Article.findByCategory = function(category, limit = 20, offset = 0) {
  return this.findAll({
    where: { category },
    order: [['publishedAt', 'DESC']],
    limit,
    offset
  });
};

module.exports = Article;