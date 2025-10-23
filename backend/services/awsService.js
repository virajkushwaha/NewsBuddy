const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const logger = require('../utils/logger');

class AWSService {
  constructor() {
    this.secretsClient = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.secretsCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  async getSecret(secretName) {
    try {
      // Check cache first
      const cached = this.secretsCache.get(secretName);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.value;
      }

      const command = new GetSecretValueCommand({
        SecretId: secretName
      });

      const response = await this.secretsClient.send(command);
      let secretValue;

      if (response.SecretString) {
        secretValue = JSON.parse(response.SecretString);
      } else {
        // Binary secret
        secretValue = Buffer.from(response.SecretBinary, 'base64').toString('ascii');
      }

      // Cache the secret
      this.secretsCache.set(secretName, {
        value: secretValue,
        timestamp: Date.now()
      });

      return secretValue;

    } catch (error) {
      logger.error(`Error retrieving secret ${secretName}:`, error);
      throw error;
    }
  }

  async getApiKeys() {
    try {
      const secretName = process.env.SECRETS_MANAGER_SECRET_NAME || 'newsbuddy/api-keys';
      const secrets = await this.getSecret(secretName);
      
      return {
        newsApiKey: secrets.NEWS_API_KEY || process.env.NEWS_API_KEY,
        newsDataKey: secrets.NEWSDATA_API_KEY || process.env.NEWSDATA_API_KEY
      };
    } catch (error) {
      logger.warn('Failed to get API keys from Secrets Manager, using environment variables');
      return {
        newsApiKey: process.env.NEWS_API_KEY,
        newsDataKey: process.env.NEWSDATA_API_KEY
      };
    }
  }

  async getDatabaseConfig() {
    try {
      const secretName = process.env.SECRETS_MANAGER_SECRET_NAME || 'newsbuddy/database';
      const secrets = await this.getSecret(secretName);
      
      return {
        mongoUri: secrets.MONGODB_URI || process.env.MONGODB_URI,
        redisUrl: secrets.REDIS_URL || process.env.REDIS_URL
      };
    } catch (error) {
      logger.warn('Failed to get database config from Secrets Manager, using environment variables');
      return {
        mongoUri: process.env.MONGODB_URI,
        redisUrl: process.env.REDIS_URL
      };
    }
  }

  clearCache() {
    this.secretsCache.clear();
    logger.info('AWS secrets cache cleared');
  }

  // Health check for AWS services
  async healthCheck() {
    try {
      // Test Secrets Manager connectivity
      await this.secretsClient.send(new GetSecretValueCommand({
        SecretId: 'test-connectivity'
      }));
      return { secretsManager: 'healthy' };
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        return { secretsManager: 'healthy' }; // Service is accessible
      }
      return { secretsManager: 'unhealthy', error: error.message };
    }
  }
}

module.exports = new AWSService();