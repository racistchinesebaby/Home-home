/**
 * Terminal App Management System (TAMS)
 * Core orchestration layer for managing self-replicating apps
 */

import { EventEmitter } from 'events';
import { AppRegistry } from './registry';
import { BackgroundAgent } from './agent';
import { TuningEngine } from './tuning';
import { AppStore } from './store';
import { AIOrchestrator } from './ai/index';

export interface AppMetadata {
  id: string;
  name: string;
  type: 'trading' | 'research' | 'tool' | 'integration' | 'custom';
  version: string;
  status: 'active' | 'inactive' | 'tuning' | 'updating' | 'error';
  origin: string; // Source app ID if cloned
  capabilities: string[];
  dependencies: Record<string, string>;
  config: Record<string, any>;
  created: Date;
  updated: Date;
}

export interface AppInstance {
  metadata: AppMetadata;
  execute: (command: string, args: any[]) => Promise<any>;
  tune: (parameters: Record<string, any>) => Promise<void>;
  clone: (overrides?: Partial<AppMetadata>) => Promise<AppInstance>;
  update: () => Promise<void>;
  destroy: () => Promise<void>;
  ai?: any; // AI capabilities for this app
}

export class TAMS extends EventEmitter {
  private registry: AppRegistry;
  private agent: BackgroundAgent;
  private tuning: TuningEngine;
  private store: AppStore;
  private apps: Map<string, AppInstance>;
  public ai: AIOrchestrator; // Public AI system accessible to all apps

  constructor() {
    super();
    this.registry = new AppRegistry();
    this.agent = new BackgroundAgent(this);
    this.tuning = new TuningEngine();
    this.store = new AppStore();
    this.apps = new Map();
    this.ai = new AIOrchestrator(this);

    this.initializeSystem();
  }

  private async initializeSystem(): Promise<void> {
    console.log('🚀 Initializing Terminal App Management System...');

    // Load existing apps from registry
    await this.registry.load();

    // Initialize AI subsystem
    await this.ai.initialize();

    // Start background agent
    await this.agent.start();

    // Initialize app store connection
    await this.store.initialize();

    this.emit('system:ready');
    console.log('✅ TAMS initialized successfully');
  }

  /**
   * Install an app from the store or local source
   */
  async installApp(source: string, config?: Record<string, any>): Promise<AppInstance> {
    console.log(`📦 Installing app from: ${source}`);

    const appDefinition = await this.store.fetchApp(source);
    const instance = await this.createAppInstance(appDefinition, config);

    this.apps.set(instance.metadata.id, instance);
    await this.registry.register(instance.metadata);

    this.emit('app:installed', instance.metadata);
    return instance;
  }

  /**
   * Create a new app instance
   */
  async createApp(
    type: AppMetadata['type'],
    name: string,
    config?: Record<string, any>
  ): Promise<AppInstance> {
    console.log(`🔨 Creating new ${type} app: ${name}`);

    const metadata: AppMetadata = {
      id: this.generateId(),
      name,
      type,
      version: '1.0.0',
      status: 'active',
      origin: 'tams',
      capabilities: this.getDefaultCapabilities(type),
      dependencies: {},
      config: config || {},
      created: new Date(),
      updated: new Date(),
    };

    const instance = await this.createAppInstance(metadata);
    this.apps.set(instance.metadata.id, instance);
    await this.registry.register(metadata);

    this.emit('app:created', metadata);
    return instance;
  }

  /**
   * Clone an existing app with modifications
   */
  async cloneApp(
    sourceId: string,
    overrides?: Partial<AppMetadata>
  ): Promise<AppInstance> {
    const source = this.apps.get(sourceId);
    if (!source) {
      throw new Error(`App not found: ${sourceId}`);
    }

    console.log(`🧬 Cloning app: ${source.metadata.name}`);
    return await source.clone(overrides);
  }

  /**
   * Tune an app using AI-powered optimization
   */
  async tuneApp(appId: string, parameters?: Record<string, any>): Promise<void> {
    const app = this.apps.get(appId);
    if (!app) {
      throw new Error(`App not found: ${appId}`);
    }

    console.log(`🎛️  Tuning app: ${app.metadata.name}`);
    app.metadata.status = 'tuning';

    const optimizations = await this.tuning.analyze(app, parameters);
    await app.tune(optimizations);

    app.metadata.status = 'active';
    app.metadata.updated = new Date();
    await this.registry.update(app.metadata);

    this.emit('app:tuned', app.metadata);
  }

  /**
   * Update app to latest version
   */
  async updateApp(appId: string): Promise<void> {
    const app = this.apps.get(appId);
    if (!app) {
      throw new Error(`App not found: ${appId}`);
    }

    console.log(`⬆️  Updating app: ${app.metadata.name}`);
    app.metadata.status = 'updating';

    await app.update();

    app.metadata.status = 'active';
    app.metadata.updated = new Date();
    await this.registry.update(app.metadata);

    this.emit('app:updated', app.metadata);
  }

  /**
   * List all installed apps
   */
  listApps(filter?: { type?: string; status?: string }): AppMetadata[] {
    let apps = Array.from(this.apps.values()).map(app => app.metadata);

    if (filter?.type) {
      apps = apps.filter(app => app.type === filter.type);
    }

    if (filter?.status) {
      apps = apps.filter(app => app.status === filter.status);
    }

    return apps;
  }

  /**
   * Execute a command on an app
   */
  async executeApp(appId: string, command: string, args: any[] = []): Promise<any> {
    const app = this.apps.get(appId);
    if (!app) {
      throw new Error(`App not found: ${appId}`);
    }

    return await app.execute(command, args);
  }

  /**
   * Remove an app
   */
  async removeApp(appId: string): Promise<void> {
    const app = this.apps.get(appId);
    if (!app) {
      throw new Error(`App not found: ${appId}`);
    }

    console.log(`🗑️  Removing app: ${app.metadata.name}`);

    await app.destroy();
    this.apps.delete(appId);
    await this.registry.unregister(appId);

    this.emit('app:removed', app.metadata);
  }

  /**
   * Search the app store
   */
  async searchStore(query: string, filters?: Record<string, any>): Promise<any[]> {
    return await this.store.search(query, filters);
  }

  /**
   * Get system status
   */
  getStatus(): {
    apps: { total: number; byType: Record<string, number>; byStatus: Record<string, number> };
    agent: { running: boolean; tasks: number };
    ai: { count: number; names: string[] };
    system: { uptime: number; memory: number };
  } {
    const apps = Array.from(this.apps.values()).map(a => a.metadata);

    return {
      apps: {
        total: apps.length,
        byType: this.groupBy(apps, 'type'),
        byStatus: this.groupBy(apps, 'status'),
      },
      agent: {
        running: this.agent.isRunning(),
        tasks: this.agent.getTaskCount(),
      },
      ai: {
        count: this.ai.getAllAIs().length,
        names: this.ai.getAllAIs().map(ai => ai.getName()),
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage().heapUsed / 1024 / 1024,
      },
    };
  }

  /**
   * Chat with AI
   */
  async chatWithAI(aiId: string, message: string, context?: any): Promise<any> {
    return await this.ai.chat(aiId, message, {
      conversationHistory: [],
      capabilities: [],
      ...context,
    });
  }

  /**
   * Get all AIs
   */
  getAIs(): any[] {
    return this.ai.getAllAIs();
  }

  // Helper methods

  private async createAppInstance(
    metadata: AppMetadata,
    config?: Record<string, any>
  ): Promise<AppInstance> {
    // Dynamic app instance creation based on type
    const { createInstance } = await import(`./apps/${metadata.type}`);
    return createInstance(metadata, config, this);
  }

  private generateId(): string {
    return `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultCapabilities(type: AppMetadata['type']): string[] {
    const capabilities: Record<string, string[]> = {
      trading: ['market-data', 'order-execution', 'backtesting', 'risk-management'],
      research: ['data-analysis', 'collaboration', 'bounties', 'publishing'],
      tool: ['automation', 'integration'],
      integration: ['api-access', 'webhooks', 'events'],
      custom: [],
    };
    return capabilities[type] || [];
  }

  private groupBy(items: any[], key: string): Record<string, number> {
    return items.reduce((acc, item) => {
      const value = item[key];
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Shutdown system gracefully
   */
  async shutdown(): Promise<void> {
    console.log('🛑 Shutting down TAMS...');

    // Shutdown AI subsystem
    await this.ai.shutdown();

    // Stop background agent
    await this.agent.stop();

    // Destroy all apps
    for (const app of this.apps.values()) {
      await app.destroy();
    }

    this.emit('system:shutdown');
    console.log('✅ TAMS shutdown complete');
  }
}

export default TAMS;
