/**
 * Integration App
 * Connect external services, APIs, and create custom workflows
 */

import { EventEmitter } from 'events';
import type { AppMetadata, AppInstance, TAMS } from '../index';
import axios from 'axios';

export interface IntegrationConfig {
  api: {
    baseUrl?: string;
    apiKey?: string;
    timeout: number;
    rateLimit: number;
    retries: number;
  };
  webhooks: {
    enabled: boolean;
    maxRetries: number;
    retryDelay: number;
    verifySignature: boolean;
  };
  events: {
    enabled: boolean;
    batchSize: number;
    flushInterval: number;
  };
}

interface WebhookHandler {
  id: string;
  url: string;
  events: string[];
  secret?: string;
}

class IntegrationApp extends EventEmitter implements AppInstance {
  metadata: AppMetadata;
  private tams: TAMS;
  private config: IntegrationConfig;
  private webhooks: Map<string, WebhookHandler>;
  private eventQueue: any[];

  constructor(metadata: AppMetadata, config: IntegrationConfig, tams: TAMS) {
    super();
    this.metadata = metadata;
    this.tams = tams;
    this.config = config;
    this.webhooks = new Map();
    this.eventQueue = [];

    this.startEventProcessor();
  }

  async execute(command: string, args: any[]): Promise<any> {
    const commands: Record<string, (...args: any[]) => Promise<any>> = {
      apiCall: (method: string, endpoint: string, data?: any) =>
        this.makeApiCall(method, endpoint, data),
      registerWebhook: (handler: WebhookHandler) => this.registerWebhook(handler),
      unregisterWebhook: (id: string) => this.unregisterWebhook(id),
      emitEvent: (event: string, data: any) => this.emitEvent(event, data),
      getWebhooks: () => this.getWebhooks(),
      testConnection: () => this.testConnection(),
    };

    const handler = commands[command];
    if (!handler) {
      throw new Error(`Unknown command: ${command}`);
    }

    return await handler(...args);
  }

  async tune(parameters: Record<string, any>): Promise<void> {
    console.log(`🎛️  Tuning integration: ${this.metadata.name}`);

    this.config = {
      ...this.config,
      ...parameters,
    };

    this.metadata.config = this.config;
    this.metadata.updated = new Date();

    this.emit('tuned', parameters);
  }

  async clone(overrides?: Partial<AppMetadata>): Promise<AppInstance> {
    console.log(`🧬 Cloning integration: ${this.metadata.name}`);

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
    return new IntegrationApp(clonedMetadata, clonedConfig, this.tams);
  }

  async update(): Promise<void> {
    console.log(`⬆️  Updating integration: ${this.metadata.name}`);

    this.metadata.version = this.incrementVersion(this.metadata.version);
    this.emit('updated', this.metadata.version);
  }

  async destroy(): Promise<void> {
    console.log(`🗑️  Destroying integration: ${this.metadata.name}`);
    this.removeAllListeners();
  }

  // Integration-specific methods

  private async makeApiCall(method: string, endpoint: string, data?: any): Promise<any> {
    const url = this.config.api.baseUrl
      ? `${this.config.api.baseUrl}${endpoint}`
      : endpoint;

    console.log(`📡 API Call: ${method} ${url}`);

    try {
      const response = await axios({
        method,
        url,
        data,
        headers: {
          'Authorization': this.config.api.apiKey ? `Bearer ${this.config.api.apiKey}` : undefined,
          'Content-Type': 'application/json',
        },
        timeout: this.config.api.timeout,
      });

      return response.data;
    } catch (error: any) {
      console.error(`API call failed:`, error.message);
      throw error;
    }
  }

  private async registerWebhook(handler: WebhookHandler): Promise<void> {
    this.webhooks.set(handler.id, handler);
    console.log(`🔗 Registered webhook: ${handler.id} -> ${handler.url}`);
  }

  private async unregisterWebhook(id: string): Promise<void> {
    this.webhooks.delete(id);
    console.log(`🔓 Unregistered webhook: ${id}`);
  }

  private async emitEvent(event: string, data: any): Promise<void> {
    console.log(`📢 Emitting event: ${event}`);

    this.eventQueue.push({
      event,
      data,
      timestamp: new Date(),
    });

    // Trigger webhooks
    for (const [id, handler] of this.webhooks.entries()) {
      if (handler.events.includes(event) || handler.events.includes('*')) {
        await this.triggerWebhook(handler, event, data);
      }
    }
  }

  private async triggerWebhook(handler: WebhookHandler, event: string, data: any): Promise<void> {
    const payload = {
      event,
      data,
      timestamp: new Date().toISOString(),
    };

    let retries = 0;
    while (retries <= this.config.webhooks.maxRetries) {
      try {
        await axios.post(handler.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Event': event,
            'X-Webhook-Signature': handler.secret
              ? this.generateSignature(payload, handler.secret)
              : undefined,
          },
          timeout: 5000,
        });

        console.log(`✅ Webhook delivered: ${handler.id}`);
        return;
      } catch (error) {
        retries++;
        if (retries > this.config.webhooks.maxRetries) {
          console.error(`❌ Webhook failed after ${retries} retries: ${handler.id}`);
          return;
        }

        await this.sleep(this.config.webhooks.retryDelay * retries);
      }
    }
  }

  private generateSignature(payload: any, secret: string): string {
    // Simplified signature generation
    // In production, use HMAC-SHA256
    return Buffer.from(JSON.stringify(payload) + secret).toString('base64');
  }

  private getWebhooks(): WebhookHandler[] {
    return Array.from(this.webhooks.values());
  }

  private async testConnection(): Promise<any> {
    if (!this.config.api.baseUrl) {
      throw new Error('No API base URL configured');
    }

    try {
      await this.makeApiCall('GET', '/');
      return { status: 'connected', timestamp: new Date() };
    } catch (error) {
      return { status: 'failed', error: (error as Error).message, timestamp: new Date() };
    }
  }

  private startEventProcessor(): void {
    if (!this.config.events.enabled) {
      return;
    }

    setInterval(() => {
      if (this.eventQueue.length >= this.config.events.batchSize) {
        this.flushEvents();
      }
    }, this.config.events.flushInterval);
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    const batch = this.eventQueue.splice(0, this.config.events.batchSize);
    console.log(`📦 Flushing ${batch.length} events`);

    // Process or store events
    this.emit('events:flushed', batch);
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
  const integrationConfig: IntegrationConfig = {
    api: config?.api || {
      timeout: 5000,
      rateLimit: 100,
      retries: 3,
    },
    webhooks: config?.webhooks || {
      enabled: true,
      maxRetries: 5,
      retryDelay: 1000,
      verifySignature: true,
    },
    events: config?.events || {
      enabled: true,
      batchSize: 100,
      flushInterval: 5000,
    },
  };

  return new IntegrationApp(metadata, integrationConfig, tams);
}
