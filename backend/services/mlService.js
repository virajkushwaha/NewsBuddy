const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const { SageMakerRuntimeClient, InvokeEndpointCommand } = require('@aws-sdk/client-sagemaker-runtime');
const logger = require('../utils/logger');
const Article = require('../models/Article');

class MLService {
  constructor() {
    this.bedrockClient = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    this.sagemakerClient = new SageMakerRuntimeClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    
    this.modelId = process.env.BEDROCK_MODEL_ID || 'amazon.titan-embed-text-v1';
    this.sagemakerEndpoint = process.env.SAGEMAKER_ENDPOINT;
  }

  async generateEmbeddings(text) {
    try {
      const input = {
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          inputText: text.substring(0, 8000) // Limit text length
        })
      };

      const command = new InvokeModelCommand(input);
      const response = await this.bedrockClient.send(command);
      
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.embedding;
      
    } catch (error) {
      logger.error('Error generating embeddings:', error);
      return null;
    }
  }

  async generateArticleEmbeddings(article) {
    try {
      const titleEmbedding = await this.generateEmbeddings(article.title);
      const contentEmbedding = article.content ? 
        await this.generateEmbeddings(article.content) : 
        await this.generateEmbeddings(article.description || '');

      return {
        title: titleEmbedding,
        content: contentEmbedding
      };
    } catch (error) {
      logger.error('Error generating article embeddings:', error);
      return null;
    }
  }

  async getPersonalizedRecommendations(userId, userPreferences, limit = 20) {
    try {
      if (!this.sagemakerEndpoint) {
        logger.warn('SageMaker endpoint not configured, using fallback recommendations');
        return await this.getFallbackRecommendations(userPreferences, limit);
      }

      const input = {
        EndpointName: this.sagemakerEndpoint,
        ContentType: 'application/json',
        Body: JSON.stringify({
          user_id: userId,
          preferences: userPreferences,
          limit: limit
        })
      };

      const command = new InvokeEndpointCommand(input);
      const response = await this.sagemakerClient.send(command);
      
      const result = JSON.parse(new TextDecoder().decode(response.Body));
      return result.recommendations;
      
    } catch (error) {
      logger.error('Error getting SageMaker recommendations:', error);
      return await this.getFallbackRecommendations(userPreferences, limit);
    }
  }

  async getFallbackRecommendations(userPreferences, limit = 20) {
    try {
      const { categories, keywords, readingHistory } = userPreferences;
      
      // Build query based on preferences
      const query = {};
      
      if (categories && categories.length > 0) {
        query.category = { $in: categories };
      }
      
      if (keywords && keywords.length > 0) {
        query.$or = [
          { keywords: { $in: keywords } },
          { title: { $regex: keywords.join('|'), $options: 'i' } },
          { description: { $regex: keywords.join('|'), $options: 'i' } }
        ];
      }

      // Exclude recently read articles
      if (readingHistory && readingHistory.length > 0) {
        const readUrls = readingHistory.map(item => item.url);
        query.url = { $nin: readUrls };
      }

      // Get recent articles (last 7 days)
      query.publishedAt = { 
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
      };

      const articles = await Article.find(query)
        .sort({ publishedAt: -1, views: -1 })
        .limit(limit);

      return articles;
      
    } catch (error) {
      logger.error('Error getting fallback recommendations:', error);
      return [];
    }
  }

  async calculateSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0;
    }

    // Cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  async findSimilarArticles(articleId, limit = 5) {
    try {
      const article = await Article.findById(articleId);
      if (!article || !article.embeddings.content) {
        return [];
      }

      const allArticles = await Article.find({
        _id: { $ne: articleId },
        'embeddings.content': { $exists: true, $ne: null }
      }).limit(100); // Limit for performance

      const similarities = [];
      
      for (const otherArticle of allArticles) {
        const similarity = await this.calculateSimilarity(
          article.embeddings.content,
          otherArticle.embeddings.content
        );
        
        if (similarity > 0.7) { // Threshold for similarity
          similarities.push({
            article: otherArticle,
            similarity
          });
        }
      }

      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit)
        .map(item => item.article);
        
    } catch (error) {
      logger.error('Error finding similar articles:', error);
      return [];
    }
  }

  async updateArticleEmbeddings() {
    try {
      const articles = await Article.find({
        $or: [
          { 'embeddings.title': { $exists: false } },
          { 'embeddings.content': { $exists: false } }
        ]
      }).limit(50); // Process in batches

      let updated = 0;
      
      for (const article of articles) {
        const embeddings = await this.generateArticleEmbeddings(article);
        
        if (embeddings) {
          article.embeddings = embeddings;
          article.indexed = true;
          article.lastIndexed = new Date();
          await article.save();
          updated++;
        }
      }

      logger.info(`Updated embeddings for ${updated} articles`);
      return updated;
      
    } catch (error) {
      logger.error('Error updating article embeddings:', error);
      return 0;
    }
  }

  async analyzeSentiment(text) {
    try {
      // Simple sentiment analysis using keyword matching
      // In production, use AWS Comprehend or similar service
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic'];
      const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'disappointing', 'worst'];
      
      const words = text.toLowerCase().split(/\W+/);
      let positiveCount = 0;
      let negativeCount = 0;
      
      words.forEach(word => {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
      });
      
      const score = (positiveCount - negativeCount) / words.length;
      let label = 'neutral';
      
      if (score > 0.01) label = 'positive';
      else if (score < -0.01) label = 'negative';
      
      return { score, label };
      
    } catch (error) {
      logger.error('Error analyzing sentiment:', error);
      return { score: 0, label: 'neutral' };
    }
  }
}

module.exports = new MLService();