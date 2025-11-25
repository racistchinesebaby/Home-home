/**
 * Example: Building a knowledge library with web scraping
 */

import { TAMS } from '../core/index';

async function webScraperExample() {
  const tams = new TAMS();

  // Wait for system to initialize
  await new Promise(resolve => {
    tams.once('system:ready', resolve);
  });

  console.log('Creating web scraper...');

  // Create a web scraper/crawler
  const scraper = await tams.createApp('tool', 'AI News Aggregator', {
    browser: 'axios',
    headless: true,
    maxConcurrency: 10,
    rateLimit: 5, // 5 requests per second
    storage: {
      enabled: true,
      path: '.tams/library',
      format: 'json',
    },
  });

  console.log(`Created scraper: ${scraper.metadata.id}`);

  // Define sources to crawl
  const sources = [
    'https://news.ycombinator.com',
    'https://techcrunch.com/category/artificial-intelligence',
    'https://www.theverge.com/ai-artificial-intelligence',
  ];

  // Start crawling
  console.log('Starting crawl...');
  const crawlJob = await tams.executeApp(scraper.metadata.id, 'crawl', [sources, 2]);

  console.log(`Crawl job started: ${crawlJob.id}`);

  // Wait for crawl to complete
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Search the library
  console.log('\nSearching for AI articles...');
  const aiArticles = await tams.executeApp(scraper.metadata.id, 'search', ['artificial intelligence']);

  console.log(`Found ${aiArticles.length} articles about AI`);

  // Extract specific article
  console.log('\nExtracting article...');
  const article = await tams.executeApp(
    scraper.metadata.id,
    'extractArticle',
    ['https://example.com/ai-breakthrough']
  );

  console.log('Article:', {
    title: article.title,
    author: article.author,
    wordCount: article.wordCount,
    readingTime: article.readingTime,
  });

  // Find posts with specific criteria
  console.log('\nFinding posts about machine learning...');
  const mlPosts = await tams.executeApp(scraper.metadata.id, 'findPosts', [
    'https://medium.com/topic/machine-learning',
    {
      keyword: 'neural networks',
      tags: ['ml', 'deep-learning'],
      dateFrom: '2024-01-01',
      depth: 3,
    },
  ]);

  console.log(`Found ${mlPosts.length} posts about ML`);

  // Get library statistics
  const stats = await tams.executeApp(scraper.metadata.id, 'getLibraryStats');

  console.log('\nLibrary Statistics:', {
    totalPages: stats.totalPages,
    totalWords: stats.totalWords,
    sources: stats.sources,
    dateRange: stats.dateRange,
  });

  // Export library to markdown
  console.log('\nExporting library...');
  const markdown = await tams.executeApp(scraper.metadata.id, 'exportLibrary', ['markdown']);

  console.log(`Exported ${markdown.length} characters to markdown`);

  // Clone scraper for different topic
  console.log('\nCloning scraper for research papers...');
  const researchScraper = await tams.cloneApp(scraper.metadata.id, {
    name: 'Research Paper Aggregator',
  });

  // Scrape research sources
  const researchSources = [
    'https://arxiv.org/list/cs.AI/recent',
    'https://paperswithcode.com/latest',
  ];

  await tams.executeApp(researchScraper.metadata.id, 'crawl', [researchSources, 2]);

  console.log('\nBoth scrapers are running!');
  console.log('Background agent will monitor and optimize crawling patterns.');

  // The background agent will:
  // - Monitor crawl success rates
  // - Optimize rate limits
  // - Detect and handle errors
  // - Suggest new sources
  // - Deduplicate content
}

// Run the example
if (require.main === module) {
  webScraperExample().catch(console.error);
}

export default webScraperExample;
