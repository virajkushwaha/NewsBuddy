// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.MONGODB_URI = 'mongodb://localhost:27017/newsbuddy-test';

// Mock external dependencies
jest.mock('../services/cronService', () => ({
  start: jest.fn(),
  stopAll: jest.fn()
}));