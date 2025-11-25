/**
 * Web Crawler/Scraper Tool
 * Automated web content extraction, crawling, and library building
 */

import { EventEmitter } from 'events';
import type { AppMetadata, AppInstance, TAMS } from '../index';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface CrawlerConfig {
  browser: 'puppeteer' | 'playwright' | 'axios';
  headless: boolean;
  maxConcurrency: number;
  respectRobotsTxt: boolean;
  rateLimit: number; // requests per second
  userAgent: string;
  features: string[];
  storage: {
    enabled: boolean;
    path: string;
    format: 'json' | 'markdown' | 'html';
  };
}

interface CrawlResult {
  url: string;
  title: string;
  content: string;
  metadata: {
    author?: string;
    publishDate?: Date;
    tags?: string[];
    description?: string;
  };
  links: string[];
  images: string[];
  timestamp: Date;
}

interface CrawlJob {
  id: string;
  urls: string[];
  depth: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: CrawlResult[];
  created: Date;
}

class ToolApp extends EventEmitter implements AppInstance {
  metadata: AppMetadata;
  private tams: TAMS;
  private config: CrawlerConfig;
  private jobs: Map<string, CrawlJob>;
  private library: Map<string, CrawlResult>; // URL -> Result

  constructor(metadata: AppMetadata, config: CrawlerConfig, tams: TAMS) {
    super();
    this.metadata = metadata;
    this.tams = tams;
    this.config = config;
    this.jobs = new Map();
    this.library = new Map();
  }

  async execute(command: string, args: any[]): Promise<any> {
    const commands: Record<string, (...args: any[]) => Promise<any>> = {
      crawl: (urls: string[], depth?: number) => this.crawl(urls, depth),
      scrape: (url: string, selectors?: any) => this.scrape(url, selectors),
      search: (query: string) => this.searchLibrary(query),
      getJob: (id: string) => this.getJob(id),
      listJobs: () => this.listJobs(),
      exportLibrary: (format?: string) => this.exportLibrary(format),
      getLibraryStats: () => this.getLibraryStats(),
      extractArticle: (url: string) => this.extractArticle(url),
      findPosts: (source: string, filters?: any) => this.findPosts(source, filters),
    };

    const handler = commands[command];
    if (!handler) {
      throw new Error(`Unknown command: ${command}`);
    }

    return await handler(...args);
  }

  async tune(parameters: Record<string, any>): Promise<void> {
    console.log(`🎛️  Tuning web crawler: ${this.metadata.name}`);

    this.config = {
      ...this.config,
      ...parameters,
    };

    this.metadata.config = this.config;
    this.metadata.updated = new Date();

    this.emit('tuned', parameters);
  }

  async clone(overrides?: Partial<AppMetadata>): Promise<AppInstance> {
    console.log(`🧬 Cloning web crawler: ${this.metadata.name}`);

    const clonedMetadata: AppMetadata = {
      ...this.metadata,
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: overrides?.name || `${this.metadata.name} (Clone)`,
      origin: this.metadata.id,
      created: new Date(),
      updated: new Date(),
      ...overrides,
    };

    const clonedConfig = { ...this.config };
    return new ToolApp(clonedMetadata, clonedConfig, this.tams);
  }

  async update(): Promise<void> {
    console.log(`⬆️  Updating web crawler: ${this.metadata.name}`);

    this.metadata.version = this.incrementVersion(this.metadata.version);
    this.emit('updated', this.metadata.version);
  }

  async destroy(): Promise<void> {
    console.log(`🗑️  Destroying web crawler: ${this.metadata.name}`);
    this.removeAllListeners();
  }

  // Crawler-specific methods

  private async crawl(urls: string[], depth: number = 1): Promise<CrawlJob> {
    const job: CrawlJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      urls,
      depth,
      status: 'pending',
      results: [],
      created: new Date(),
    };

    this.jobs.set(job.id, job);
    console.log(`🕷️  Starting crawl job: ${job.id}`);

    // Start crawling asynchronously
    this.executeCrawl(job);

    return job;
  }

  private async executeCrawl(job: CrawlJob): Promise<void> {
    job.status = 'running';
    this.emit('crawl:started', job.id);

    try {
      const visited = new Set<string>();
      const queue = job.urls.map(url => ({ url, depth: 0 }));

      while (queue.length > 0) {
        const { url, depth } = queue.shift()!;

        if (visited.has(url) || depth > job.depth) {
          continue;
        }

        visited.add(url);

        try {
          const result = await this.fetchPage(url);
          job.results.push(result);
          this.library.set(url, result);

          // Add linked pages to queue
          if (depth < job.depth) {
            for (const link of result.links) {
              if (!visited.has(link)) {
                queue.push({ url: link, depth: depth + 1 });
              }
            }
          }

          // Respect rate limit
          await this.sleep(1000 / this.config.rateLimit);
        } catch (error) {
          console.error(`Failed to crawl ${url}:`, error);
        }
      }

      job.status = 'completed';
      this.emit('crawl:completed', job.id);
      console.log(`✅ Crawl job completed: ${job.id} (${job.results.length} pages)`);
    } catch (error) {
      job.status = 'failed';
      this.emit('crawl:failed', job.id);
      console.error(`❌ Crawl job failed: ${job.id}`, error);
    }
  }

  private async scrape(url: string, selectors?: any): Promise<CrawlResult> {
    console.log(`📄 Scraping: ${url}`);
    return await this.fetchPage(url, selectors);
  }

  private async fetchPage(url: string, selectors?: any): Promise<CrawlResult> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': this.config.userAgent,
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Extract content based on selectors or default heuristics
    const title = $('title').text() || $('h1').first().text() || 'Untitled';
    const content = selectors?.content
      ? $(selectors.content).text()
      : this.extractMainContent($);

    const metadata = {
      author: $('meta[name="author"]').attr('content'),
      publishDate: this.parseDate($('meta[property="article:published_time"]').attr('content')),
      tags: this.extractTags($),
      description: $('meta[name="description"]').attr('content'),
    };

    const links = this.extractLinks($, url);
    const images = this.extractImages($, url);

    return {
      url,
      title,
      content,
      metadata,
      links,
      images,
      timestamp: new Date(),
    };
  }

  private extractMainContent($: cheerio.CheerioAPI): string {
    // Try common content selectors
    const selectors = [
      'article',
      '.post-content',
      '.article-content',
      '.entry-content',
      'main',
      '#content',
    ];

    for (const selector of selectors) {
      const content = $(selector).text();
      if (content && content.length > 100) {
        return content.trim();
      }
    }

    // Fallback to body
    return $('body').text().trim();
  }

  private extractLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const links: string[] = [];

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const absolute = new URL(href, baseUrl).href;
          links.push(absolute);
        } catch (error) {
          // Invalid URL, skip
        }
      }
    });

    return [...new Set(links)]; // Remove duplicates
  }

  private extractImages($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const images: string[] = [];

    $('img[src]').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        try {
          const absolute = new URL(src, baseUrl).href;
          images.push(absolute);
        } catch (error) {
          // Invalid URL, skip
        }
      }
    });

    return [...new Set(images)];
  }

  private extractTags($: cheerio.CheerioAPI): string[] {
    const tags: string[] = [];

    $('meta[property="article:tag"]').each((_, el) => {
      const tag = $(el).attr('content');
      if (tag) tags.push(tag);
    });

    $('.tag, .tags a').each((_, el) => {
      tags.push($(el).text().trim());
    });

    return [...new Set(tags)];
  }

  private parseDate(dateStr?: string): Date | undefined {
    if (!dateStr) return undefined;
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }

  private async extractArticle(url: string): Promise<any> {
    console.log(`📰 Extracting article from: ${url}`);

    const result = await this.fetchPage(url);

    // Enhanced article extraction
    return {
      title: result.title,
      content: result.content,
      summary: result.content.substring(0, 200) + '...',
      wordCount: result.content.split(/\s+/).length,
      readingTime: Math.ceil(result.content.split(/\s+/).length / 200), // minutes
      ...result.metadata,
      url: result.url,
      images: result.images,
      extractedAt: result.timestamp,
    };
  }

  private async findPosts(source: string, filters?: any): Promise<CrawlResult[]> {
    console.log(`🔍 Finding posts from: ${source}`);

    // Crawl the source
    const job = await this.crawl([source], filters?.depth || 2);

    // Wait for crawl to complete (simplified)
    await this.waitForJob(job.id);

    // Filter results based on criteria
    let results = job.results;

    if (filters?.dateFrom) {
      results = results.filter(r => r.timestamp >= new Date(filters.dateFrom));
    }

    if (filters?.tags) {
      const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
      results = results.filter(r =>
        tags.some(tag => r.metadata.tags?.includes(tag))
      );
    }

    if (filters?.keyword) {
      const keyword = filters.keyword.toLowerCase();
      results = results.filter(
        r =>
          r.title.toLowerCase().includes(keyword) ||
          r.content.toLowerCase().includes(keyword)
      );
    }

    return results;
  }

  private async searchLibrary(query: string): Promise<CrawlResult[]> {
    const lowerQuery = query.toLowerCase();

    return Array.from(this.library.values()).filter(
      result =>
        result.title.toLowerCase().includes(lowerQuery) ||
        result.content.toLowerCase().includes(lowerQuery) ||
        result.metadata.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  private getJob(id: string): CrawlJob | undefined {
    return this.jobs.get(id);
  }

  private listJobs(): CrawlJob[] {
    return Array.from(this.jobs.values());
  }

  private async exportLibrary(format: string = 'json'): Promise<any> {
    const results = Array.from(this.library.values());

    if (format === 'json') {
      return results;
    } else if (format === 'markdown') {
      return results.map(r => this.toMarkdown(r)).join('\n\n---\n\n');
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  }

  private toMarkdown(result: CrawlResult): string {
    return `# ${result.title}

**URL:** ${result.url}
**Author:** ${result.metadata.author || 'Unknown'}
**Published:** ${result.metadata.publishDate?.toLocaleDateString() || 'Unknown'}
**Tags:** ${result.metadata.tags?.join(', ') || 'None'}

${result.content}`;
  }

  private getLibraryStats(): any {
    const results = Array.from(this.library.values());

    return {
      totalPages: results.length,
      totalWords: results.reduce((sum, r) => sum + r.content.split(/\s+/).length, 0),
      sources: new Set(results.map(r => new URL(r.url).hostname)).size,
      dateRange: {
        oldest: results.reduce((min, r) => (r.timestamp < min ? r.timestamp : min), new Date()),
        newest: results.reduce((max, r) => (r.timestamp > max ? r.timestamp : max), new Date(0)),
      },
    };
  }

  private async waitForJob(jobId: string, timeout: number = 300000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const job = this.jobs.get(jobId);

      if (job && (job.status === 'completed' || job.status === 'failed')) {
        return;
      }

      await this.sleep(1000);
    }

    throw new Error(`Job ${jobId} timeout`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private incrementVersion(version: string): string {
    const parts = version.split('.');
    parts[2] = (parseInt(parts[2]) + 1).toString();
    return parts.join('.');
  }
}

export function createInstance(
  metadata: AppMetadata,
  config: any,
  tams: TAMS
): AppInstance {
  const crawlerConfig: CrawlerConfig = {
    browser: config?.browser || 'axios',
    headless: config?.headless !== false,
    maxConcurrency: config?.maxConcurrency || 5,
    respectRobotsTxt: config?.respectRobotsTxt !== false,
    rateLimit: config?.rateLimit || 2,
    userAgent:
      config?.userAgent ||
      'Mozilla/5.0 (compatible; TAMS-Crawler/1.0; +https://tams.io/bot)',
    features: config?.features || ['navigation', 'scraping', 'screenshots'],
    storage: config?.storage || {
      enabled: true,
      path: '.tams/library',
      format: 'json',
    },
  };

  return new ToolApp(metadata, crawlerConfig, tams);
}
