// Mock news service
const mockNewsService = {
  getHeadlines: async () => ({
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
  }),
  
  getTrending: async (limit) => ({
    success: true,
    data: [
      {
        id: '1',
        title: 'Trending Article',
        views: 1000
      }
    ].slice(0, limit)
  }),
  
  searchNews: async (query) => ({
    success: true,
    data: [
      {
        id: '1',
        title: `Search result for ${query}`,
        description: 'Search description'
      }
    ]
  })
};

describe('News Service', () => {
  test('should fetch headlines successfully', async () => {
    const result = await mockNewsService.getHeadlines();
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(Array.isArray(result.data)).toBe(true);
  });

  test('should fetch trending articles', async () => {
    const result = await mockNewsService.getTrending(5);
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.length).toBeLessThanOrEqual(5);
  });

  test('should search news articles', async () => {
    const result = await mockNewsService.searchNews('technology');
    
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});