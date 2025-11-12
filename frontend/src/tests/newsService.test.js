import newsService from '../services/newsService';

// Mock axios
jest.mock('../services/api', () => ({
  get: jest.fn(() => Promise.resolve({
    data: {
      success: true,
      data: [
        {
          id: '1',
          title: 'Test Article',
          description: 'Test description',
          url: 'https://test.com',
          publishedAt: new Date().toISOString(),
          source: { name: 'Test Source' }
        }
      ]
    }
  }))
}));

describe('News Service', () => {
  test('should fetch headlines successfully', async () => {
    const result = await newsService.getHeadlines();
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  test('should fetch trending articles', async () => {
    const result = await newsService.getTrending(5);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.length).toBeLessThanOrEqual(5);
  });

  test('should search news articles', async () => {
    const result = await newsService.searchNews('technology');
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});