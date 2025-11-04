const mockArticles = [
  {
    title: "Breaking: Major Tech Company Announces Revolutionary AI Breakthrough",
    description: "A leading technology company has unveiled a groundbreaking artificial intelligence system that promises to transform multiple industries.",
    content: "In a landmark announcement today, the company revealed their latest AI innovation...",
    url: "https://example.com/tech-breakthrough-1",
    urlToImage: "https://via.placeholder.com/800x400/0066cc/ffffff?text=Tech+News",
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    source: { id: "tech-news", name: "Tech News Daily" },
    author: "Sarah Johnson",
    category: "technology"
  },
  {
    title: "Global Markets Show Strong Recovery Amid Economic Optimism",
    description: "Stock markets worldwide are experiencing significant gains as investors show renewed confidence in economic recovery.",
    content: "Financial markets across the globe are celebrating...",
    url: "https://example.com/market-recovery-1",
    urlToImage: "https://via.placeholder.com/800x400/009900/ffffff?text=Business+News",
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    source: { id: "business-wire", name: "Business Wire" },
    author: "Michael Chen",
    category: "business"
  },
  {
    title: "Championship Finals Set as Teams Prepare for Epic Showdown",
    description: "Two powerhouse teams will face off in what promises to be the most exciting championship final in recent history.",
    content: "Sports fans around the world are eagerly anticipating...",
    url: "https://example.com/championship-finals-1",
    urlToImage: "https://via.placeholder.com/800x400/ff6600/ffffff?text=Sports+News",
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    source: { id: "sports-center", name: "Sports Center" },
    author: "David Rodriguez",
    category: "sports"
  },
  {
    title: "Medical Researchers Discover Promising New Treatment Approach",
    description: "Scientists have identified a novel therapeutic method that could revolutionize treatment for a common medical condition.",
    content: "A team of international researchers has made a significant breakthrough...",
    url: "https://example.com/medical-breakthrough-1",
    urlToImage: "https://via.placeholder.com/800x400/cc0066/ffffff?text=Health+News",
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    source: { id: "health-today", name: "Health Today" },
    author: "Dr. Emily Watson",
    category: "health"
  },
  {
    title: "Climate Scientists Report Encouraging Environmental Progress",
    description: "New data shows positive trends in environmental conservation efforts and renewable energy adoption worldwide.",
    content: "Environmental scientists are reporting encouraging news...",
    url: "https://example.com/climate-progress-1",
    urlToImage: "https://via.placeholder.com/800x400/00cc99/ffffff?text=Science+News",
    publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    source: { id: "science-daily", name: "Science Daily" },
    author: "Dr. James Green",
    category: "science"
  },
  {
    title: "Hollywood Buzzes with Excitement Over Upcoming Film Festival",
    description: "The entertainment industry is preparing for one of the year's most anticipated film festivals featuring groundbreaking cinema.",
    content: "The film industry is abuzz with excitement...",
    url: "https://example.com/film-festival-1",
    urlToImage: "https://via.placeholder.com/800x400/9900cc/ffffff?text=Entertainment",
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    source: { id: "entertainment-weekly", name: "Entertainment Weekly" },
    author: "Lisa Martinez",
    category: "entertainment"
  },
  {
    title: "Local Community Comes Together for Charity Drive Success",
    description: "A grassroots charity initiative has exceeded all expectations, bringing the community together for a worthy cause.",
    content: "Local residents have demonstrated the power of community...",
    url: "https://example.com/charity-drive-1",
    urlToImage: "https://via.placeholder.com/800x400/666666/ffffff?text=General+News",
    publishedAt: new Date(Date.now() - 14 * 60 * 60 * 1000),
    source: { id: "local-news", name: "Local News Network" },
    author: "Robert Thompson",
    category: "general"
  },
  {
    title: "Innovative Startup Secures Major Funding for Green Technology",
    description: "A promising startup focused on sustainable technology solutions has successfully raised significant investment capital.",
    content: "The startup ecosystem continues to thrive...",
    url: "https://example.com/startup-funding-1",
    urlToImage: "https://via.placeholder.com/800x400/0066cc/ffffff?text=Tech+Business",
    publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
    source: { id: "startup-news", name: "Startup News" },
    author: "Amanda Foster",
    category: "business"
  }
];

module.exports = mockArticles;