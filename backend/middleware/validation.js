const Joi = require('joi');
const logger = require('../utils/logger');

// Registration validation schema
const registrationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  preferences: Joi.object({
    categories: Joi.array().items(
      Joi.string().valid('business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology')
    ),
    sources: Joi.array().items(Joi.string()),
    keywords: Joi.array().items(Joi.string()),
    language: Joi.string().default('en'),
    country: Joi.string().default('us')
  }).optional()
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Query validation schema
const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  country: Joi.string().length(2),
  category: Joi.string().valid('business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology'),
  q: Joi.string().max(500),
  sortBy: Joi.string().valid('relevancy', 'popularity', 'publishedAt').default('publishedAt'),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// User preferences validation schema
const preferencesSchema = Joi.object({
  categories: Joi.array().items(
    Joi.string().valid('business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology')
  ),
  sources: Joi.array().items(Joi.string()),
  keywords: Joi.array().items(Joi.string().max(50)),
  language: Joi.string().length(2),
  country: Joi.string().length(2)
});

// User settings validation schema
const settingsSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark'),
  notifications: Joi.object({
    email: Joi.boolean(),
    push: Joi.boolean(),
    breaking: Joi.boolean()
  }),
  privacy: Joi.object({
    profilePublic: Joi.boolean(),
    showReadingHistory: Joi.boolean()
  })
});

// Profile validation schema
const profileSchema = Joi.object({
  firstName: Joi.string().max(50),
  lastName: Joi.string().max(50),
  bio: Joi.string().max(500),
  location: Joi.string().max(100)
});

// Search validation schema
const searchSchema = Joi.object({
  query: Joi.string().min(1).max(500).required(),
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().valid('relevance', 'date').default('relevance')
});

// Generic validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      logger.warn('Validation error:', errorMessages);
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessages
      });
    }

    req.body = value;
    next();
  };
};

// Query validation middleware
const validateQuery = (req, res, next) => {
  const { error, value } = querySchema.validate(req.query, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    logger.warn('Query validation error:', errorMessages);
    
    return res.status(400).json({
      success: false,
      message: 'Query validation error',
      errors: errorMessages
    });
  }

  req.query = value;
  next();
};

// Search query validation middleware
const validateSearchQuery = (req, res, next) => {
  const { error, value } = searchSchema.validate(req.query, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    logger.warn('Search validation error:', errorMessages);
    
    return res.status(400).json({
      success: false,
      message: 'Search validation error',
      errors: errorMessages
    });
  }

  req.query = value;
  next();
};

module.exports = {
  validateRegistration: validate(registrationSchema),
  validateLogin: validate(loginSchema),
  validateQuery,
  validateSearchQuery,
  validatePreferences: validate(preferencesSchema),
  validateSettings: validate(settingsSchema),
  validateProfile: validate(profileSchema)
};