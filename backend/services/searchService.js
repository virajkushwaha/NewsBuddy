const { Client } = require('@opensearch-project/opensearch');
const mlService = require('./mlService');
const Article = require('../models/Article');
const logger = require('../utils/logger');

class SearchService {
  constructor() {
    this.client = null;
    this.indexName = 'newsbuddy-articles';
    this.initializeClient();
  }

  initializeClient() {
    try {
      if (process.env.OPENSEARCH_ENDPOINT) {
        this.client = new Client({
          node: process.env.OPENSEARCH_ENDPOINT,
          auth: {
            username: process.env.OPENSEARCH_USERNAME || 'admin',
            password: process.env.OPENSEARCH_PASSWORD || 'admin'
          },
          ssl: {
            rejectUnauthorized: false
          }
        });
        logger.info('OpenSearch client initialized');
      } else {
        logger.warn('OpenSearch endpoint not configured, using fallback search');
      }
    } catch (error) {
      logger.error('Failed to initialize OpenSearch client:', error);
    }
  }

  async createIndex() {
    if (!this.client) return false;

    try {
      const indexExists = await this.client.indices.exists({
        index: this.indexName
      });

      if (!indexExists.body) {
        await this.client.indices.create({
          index: this.indexName,
          body: {
            mappings: {
              properties: {
                title: {
                  type: 'text',
                  analyzer: 'standard',
                  fields: {
                    keyword: { type: 'keyword' }
                  }
                },
                description: {
                  type: 'text',
                  analyzer: 'standard'
                },
                content: {
                  type: 'text',
                  analyzer: 'standard'
                },
                url: { type: 'keyword' },
                publishedAt: { type: 'date' },
                category: { type: 'keyword' },
                source: {
                  properties: {
                    name: { type: 'keyword' }
                  }
                },
                keywords: { type: 'keyword' },
                embeddings: {
                  properties: {
                    title: {
                      type: 'dense_vector',
                      dims: 1536
                    },
                    content: {
                      type: 'dense_vector',
                      dims: 1536
                    }
                  }
                },
                views: { type: 'integer' },
                likes: { type: 'integer' }
              }
            },
            settings: {
              number_of_shards: 1,
              number_of_replicas: 0
            }
          }
        });
        logger.info('OpenSearch index created');
      }
      return true;
    } catch (error) {
      logger.error('Error creating OpenSearch index:', error);
      return false;
    }
  }

  async indexArticle(article) {
    if (!this.client) return false;

    try {
      await this.client.index({
        index: this.indexName,
        id: article._id.toString(),
        body: {
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          publishedAt: article.publishedAt,
          category: article.category,
          source: article.source,
          keywords: article.keywords,
          embeddings: article.embeddings,
          views: article.views,
          likes: article.likes
        }
      });
      return true;
    } catch (error) {
      logger.error('Error indexing article:', error);
      return false;
    }
  }

  async semanticSearch(query, limit = 20, offset = 0) {
    try {
      if (!this.client) {
        logger.warn('OpenSearch not available, using fallback search');
        return await this.fallbackSearch(query, limit, offset);
      }

      // Generate query embedding
      const queryEmbedding = await mlService.generateEmbeddings(query);
      
      if (!queryEmbedding) {
        return await this.fallbackSearch(query, limit, offset);
      }

      // Perform vector search
      const response = await this.client.search({
        index: this.indexName,
        body: {
          size: limit,
          from: offset,
          query: {
            bool: {
              should: [
                {
                  script_score: {
                    query: { match_all: {} },
                    script: {
                      source: "cosineSimilarity(params.query_vector, 'embeddings.title') + 1.0",
                      params: {
                        query_vector: queryEmbedding
                      }
                    }
                  }
                },
                {
                  script_score: {
                    query: { match_all: {} },
                    script: {
                      source: "cosineSimilarity(params.query_vector, 'embeddings.content') + 1.0",
                      params: {
                        query_vector: queryEmbedding
                      }
                    }
                  }
                }
              ]
            }
          },
          sort: [
            { _score: { order: 'desc' } },
            { publishedAt: { order: 'desc' } }
          ]
        }
      });

      return response.body.hits.hits.map(hit => ({
        ...hit._source,
        _id: hit._id,
        score: hit._score
      }));

    } catch (error) {
      logger.error('Semantic search error:', error);
      return await this.fallbackSearch(query, limit, offset);
    }
  }

  async fallbackSearch(query, limit = 20, offset = 0) {
    try {
      return await Article.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
      .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
      .skip(offset)
      .limit(limit);
    } catch (error) {
      logger.error('Fallback search error:', error);
      return [];
    }
  }

  async getSearchSuggestions(query, limit = 10) {
    try {
      if (!this.client) {
        return await this.getFallbackSuggestions(query, limit);
      }

      const response = await this.client.search({
        index: this.indexName,
        body: {
          size: 0,
          suggest: {
            title_suggest: {
              prefix: query,
              completion: {
                field: 'title.suggest',
                size: limit
              }
            }
          }
        }
      });

      return response.body.suggest.title_suggest[0].options.map(option => ({
        text: option.text,
        score: option._score
      }));

    } catch (error) {
      logger.error('Search suggestions error:', error);
      return await this.getFallbackSuggestions(query, limit);
    }
  }

  async getFallbackSuggestions(query, limit = 10) {
    try {
      const articles = await Article.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { keywords: { $regex: query, $options: 'i' } }
        ]
      })
      .select('title keywords')
      .limit(limit);

      const suggestions = new Set();
      
      articles.forEach(article => {
        // Add title words that match
        const titleWords = article.title.toLowerCase().split(' ');
        titleWords.forEach(word => {
          if (word.includes(query.toLowerCase()) && word.length > 2) {
            suggestions.add(word);
          }
        });

        // Add matching keywords
        article.keywords.forEach(keyword => {
          if (keyword.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(keyword);
          }
        });
      });

      return Array.from(suggestions).slice(0, limit).map(text => ({ text }));

    } catch (error) {
      logger.error('Fallback suggestions error:', error);
      return [];
    }
  }

  async indexAllArticles() {
    if (!this.client) return 0;

    try {
      await this.createIndex();
      
      const articles = await Article.find({ indexed: { $ne: true } }).limit(100);
      let indexed = 0;

      for (const article of articles) {
        const success = await this.indexArticle(article);
        if (success) {
          article.indexed = true;
          article.lastIndexed = new Date();
          await article.save();
          indexed++;
        }
      }

      logger.info(`Indexed ${indexed} articles in OpenSearch`);
      return indexed;

    } catch (error) {
      logger.error('Error indexing articles:', error);
      return 0;
    }
  }

  async deleteIndex() {
    if (!this.client) return false;

    try {
      await this.client.indices.delete({
        index: this.indexName
      });
      logger.info('OpenSearch index deleted');
      return true;
    } catch (error) {
      logger.error('Error deleting index:', error);
      return false;
    }
  }
}

module.exports = new SearchService();