const request = require('supertest');
const { app } = require('../server');

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