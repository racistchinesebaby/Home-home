/**
 * App Store
 * Marketplace for app templates, plugins, and integrations
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import axios from 'axios';

export interface StoreApp {
  id: string;
  name: string;
  description: string;
  type: 'trading' | 'research' | 'tool' | 'integration' | 'custom';
  version: string;
  author: string;
  price: number; // 0 for free
  rating: number;
  downloads: number;
  tags: string[];
  capabilities: string[];
  dependencies: Record<string, string>;
  sourceUrl?: string;
  template: Record<string, any>;
  screenshots?: string[];
  documentation?: string;
}

export interface StoreCategory {
  id: string;
  name: string;
  description: string;
  apps: string[]; // App IDs
}

export class AppStore {
  private storePath: string;
  private apps: Map<string, StoreApp>;
  private categories: Map<string, StoreCategory>;
  private remoteStoreUrl?: string;

  constructor(basePath: string = path.join(process.cwd(), '.tams', 'store')) {
    this.storePath = basePath;
    this.apps = new Map();
    this.categories = new Map();
    this.remoteStoreUrl = process.env.TAMS_STORE_URL;
  }

  async initialize(): Promise<void> {
    await fs.ensureDir(this.storePath);

    // Load local store
    await this.loadLocalStore();

    // Sync with remote store if configured
    if (this.remoteStoreUrl) {
      await this.syncWithRemote();
    }

    console.log(`🏪 App Store initialized with ${this.apps.size} apps`);
  }

  private async loadLocalStore(): Promise<void> {
    const storeFile = path.join(this.storePath, 'apps.json');

    try {
      const data = await fs.readJSON(storeFile, { throws: false }) || [];
      for (const app of data) {
        this.apps.set(app.id, app);
      }
    } catch (error) {
      console.warn('No local store found, using defaults');
      await this.seedDefaultApps();
    }

    // Load categories
    const categoriesFile = path.join(this.storePath, 'categories.json');
    try {
      const categories = await fs.readJSON(categoriesFile, { throws: false }) || [];
      for (const category of categories) {
        this.categories.set(category.id, category);
      }
    } catch (error) {
      await this.seedDefaultCategories();
    }
  }

  private async syncWithRemote(): Promise<void> {
    try {
      console.log('🔄 Syncing with remote store...');
      const response = await axios.get(`${this.remoteStoreUrl}/apps`);
      const remoteApps: StoreApp[] = response.data;

      for (const app of remoteApps) {
        this.apps.set(app.id, app);
      }

      await this.saveStore();
      console.log(`✅ Synced ${remoteApps.length} apps from remote store`);
    } catch (error) {
      console.warn('Failed to sync with remote store:', error);
    }
  }

  private async seedDefaultApps(): Promise<void> {
    const defaultApps: StoreApp[] = [
      {
        id: 'trading-algo-basic',
        name: 'Basic Trading Algorithm',
        description: 'A simple trading algorithm template with market data integration',
        type: 'trading',
        version: '1.0.0',
        author: 'TAMS Core',
        price: 0,
        rating: 4.5,
        downloads: 1250,
        tags: ['trading', 'algorithm', 'beginner'],
        capabilities: ['market-data', 'order-execution', 'backtesting'],
        dependencies: {
          'ccxt': '^4.0.0',
          'technicalindicators': '^3.1.0',
        },
        template: {
          strategy: 'moving-average-crossover',
          indicators: ['SMA', 'EMA'],
          timeframe: '1h',
        },
        documentation: 'https://docs.tams.io/apps/trading-algo-basic',
      },
      {
        id: 'research-forum',
        name: 'Research Forum with Bounties',
        description: 'Collaborative research platform with bounty system',
        type: 'research',
        version: '1.0.0',
        author: 'TAMS Core',
        price: 0,
        rating: 4.8,
        downloads: 820,
        tags: ['research', 'collaboration', 'bounties'],
        capabilities: ['data-analysis', 'collaboration', 'bounties', 'publishing'],
        dependencies: {
          'express': '^4.18.0',
          'socket.io': '^4.5.0',
          'mongodb': '^5.0.0',
        },
        template: {
          features: ['discussions', 'bounties', 'voting', 'reputation'],
          authentication: 'oauth2',
          storage: 'mongodb',
        },
        documentation: 'https://docs.tams.io/apps/research-forum',
      },
      {
        id: 'ai-assistant',
        name: 'AI Assistant Integration',
        description: 'Connect to multiple AI models for automated tasks',
        type: 'integration',
        version: '1.0.0',
        author: 'TAMS Core',
        price: 0,
        rating: 4.9,
        downloads: 2100,
        tags: ['ai', 'integration', 'automation'],
        capabilities: ['api-access', 'webhooks', 'events'],
        dependencies: {
          'openai': '^4.0.0',
          '@anthropic-ai/sdk': '^0.10.0',
        },
        template: {
          models: ['claude-opus-4.1', 'gpt-5', 'gpt-4'],
          features: ['chat', 'completion', 'analysis'],
        },
        documentation: 'https://docs.tams.io/apps/ai-assistant',
      },
      {
        id: 'browser-automation',
        name: 'Browser Automation Tool',
        description: 'Automate web interactions and data extraction',
        type: 'tool',
        version: '1.0.0',
        author: 'TAMS Core',
        price: 0,
        rating: 4.6,
        downloads: 1500,
        tags: ['browser', 'automation', 'scraping'],
        capabilities: ['automation', 'integration'],
        dependencies: {
          'puppeteer': '^21.0.0',
          'playwright': '^1.40.0',
        },
        template: {
          browser: 'chromium',
          headless: true,
          features: ['navigation', 'scraping', 'screenshots'],
        },
        documentation: 'https://docs.tams.io/apps/browser-automation',
      },
    ];

    for (const app of defaultApps) {
      this.apps.set(app.id, app);
    }

    await this.saveStore();
  }

  private async seedDefaultCategories(): Promise<void> {
    const defaultCategories: StoreCategory[] = [
      {
        id: 'trading',
        name: 'Trading & Finance',
        description: 'Trading algorithms, market analysis, and financial tools',
        apps: ['trading-algo-basic'],
      },
      {
        id: 'research',
        name: 'Research & Collaboration',
        description: 'Research platforms, forums, and knowledge sharing',
        apps: ['research-forum'],
      },
      {
        id: 'ai',
        name: 'AI & Machine Learning',
        description: 'AI integrations, models, and automation',
        apps: ['ai-assistant'],
      },
      {
        id: 'automation',
        name: 'Automation & Tools',
        description: 'Productivity tools and automation utilities',
        apps: ['browser-automation'],
      },
    ];

    for (const category of defaultCategories) {
      this.categories.set(category.id, category);
    }

    await this.saveCategories();
  }

  async search(query: string, filters?: Record<string, any>): Promise<StoreApp[]> {
    let results = Array.from(this.apps.values());

    // Text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(
        app =>
          app.name.toLowerCase().includes(lowerQuery) ||
          app.description.toLowerCase().includes(lowerQuery) ||
          app.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    // Apply filters
    if (filters?.type) {
      results = results.filter(app => app.type === filters.type);
    }

    if (filters?.minRating) {
      results = results.filter(app => app.rating >= filters.minRating);
    }

    if (filters?.free) {
      results = results.filter(app => app.price === 0);
    }

    if (filters?.tags) {
      const tags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
      results = results.filter(app => tags.some(tag => app.tags.includes(tag)));
    }

    // Sort by downloads (popular first)
    results.sort((a, b) => b.downloads - a.downloads);

    return results;
  }

  async fetchApp(appId: string): Promise<StoreApp> {
    const app = this.apps.get(appId);

    if (!app) {
      throw new Error(`App not found in store: ${appId}`);
    }

    // Increment download count
    app.downloads += 1;
    await this.saveStore();

    return app;
  }

  async publishApp(app: Omit<StoreApp, 'id' | 'rating' | 'downloads'>): Promise<StoreApp> {
    const fullApp: StoreApp = {
      ...app,
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rating: 0,
      downloads: 0,
    };

    this.apps.set(fullApp.id, fullApp);
    await this.saveStore();

    console.log(`📤 Published app: ${fullApp.name}`);
    return fullApp;
  }

  async getCategories(): Promise<StoreCategory[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryApps(categoryId: string): Promise<StoreApp[]> {
    const category = this.categories.get(categoryId);

    if (!category) {
      throw new Error(`Category not found: ${categoryId}`);
    }

    return category.apps
      .map(appId => this.apps.get(appId))
      .filter((app): app is StoreApp => app !== undefined);
  }

  private async saveStore(): Promise<void> {
    const storeFile = path.join(this.storePath, 'apps.json');
    const apps = Array.from(this.apps.values());
    await fs.writeJSON(storeFile, apps, { spaces: 2 });
  }

  private async saveCategories(): Promise<void> {
    const categoriesFile = path.join(this.storePath, 'categories.json');
    const categories = Array.from(this.categories.values());
    await fs.writeJSON(categoriesFile, categories, { spaces: 2 });
  }
}
