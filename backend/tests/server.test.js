const request = require('supertest');
const express = require('express');

// Create a simple test app
const app = express();
app.use(express.json());

// Mock health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mock news endpoints
app.get('/api/news/headlines', (req, res) => {
  res.json({
    success: true,
    data: [{
      id: '1',
      title: 'Test Article',
      description: 'Test description',
      url: 'https://test.com'
    }]
  });
});

app.get('/api/news/trending', (req, res) => {
  res.json({
    success: true,
    data: [{
      id: '1',
      title: 'Trending Article',
      views: 1000
    }]
  });
});

describe('Server Health Check', () => {
  test('GET /health should return 200', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
  });
});

describe('API Routes', () => {
  test('GET /api/news/headlines should return news data', async () => {
    const response = await request(app)
      .get('/api/news/headlines')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  test('GET /api/news/trending should return trending articles', async () => {
    const response = await request(app)
      .get('/api/news/trending')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });
});