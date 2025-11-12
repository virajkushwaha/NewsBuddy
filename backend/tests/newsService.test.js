const newsService = require('../services/newsService');

describe('News Service', () => {
  test('should fetch mock articles when API fails', async () => {
    const articles = await newsService.getMockArticles('technology', 5);
    
    expect(articles).toBeDefined();
    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBeLessThanOrEqual(5);
  });

  test('should determine article category correctly', () => {
    const category = newsService.determineCategory('AI breakthrough in technology', 'New artificial intelligence system');
    expect(category).toBe('technology');
  });

  test('should fetch trending articles', async () => {
    const articles = await newsService.getTrendingArticles(10);
    expect(articles).toBeDefined();
  });
});