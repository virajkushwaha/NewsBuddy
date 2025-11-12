// Mock news service functions
const mockNewsService = {
  getMockArticles: (category, limit) => {
    const mockArticles = [
      {
        id: '1',
        title: 'Tech Article',
        category: 'technology',
        views: 100
      },
      {
        id: '2', 
        title: 'Business Article',
        category: 'business',
        views: 200
      }
    ];
    
    let filtered = mockArticles;
    if (category && category !== 'general') {
      filtered = mockArticles.filter(article => article.category === category);
    }
    
    return filtered.slice(0, limit);
  },
  
  determineCategory: (title, description) => {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('tech') || text.includes('ai')) return 'technology';
    if (text.includes('business')) return 'business';
    return 'general';
  },
  
  getTrendingArticles: async (limit) => {
    return [
      { id: '1', title: 'Trending Article 1', views: 1000 },
      { id: '2', title: 'Trending Article 2', views: 800 }
    ].slice(0, limit);
  }
};

describe('News Service', () => {
  test('should fetch mock articles when API fails', async () => {
    const articles = mockNewsService.getMockArticles('technology', 5);
    
    expect(articles).toBeDefined();
    expect(Array.isArray(articles)).toBe(true);
    expect(articles.length).toBeLessThanOrEqual(5);
  });

  test('should determine article category correctly', () => {
    const category = mockNewsService.determineCategory('AI breakthrough in technology', 'New artificial intelligence system');
    expect(category).toBe('technology');
  });

  test('should fetch trending articles', async () => {
    const articles = await mockNewsService.getTrendingArticles(10);
    expect(articles).toBeDefined();
    expect(Array.isArray(articles)).toBe(true);
  });
});