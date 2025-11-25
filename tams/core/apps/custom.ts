/**
 * Custom App
 * Generic app type for user-defined applications
 */

import { EventEmitter } from 'events';
import type { AppMetadata, AppInstance, TAMS } from '../index';

export interface CustomConfig {
  handlers: Record<string, Function>;
  state: Record<string, any>;
  features: string[];
}

class CustomApp extends EventEmitter implements AppInstance {
  metadata: AppMetadata;
  private tams: TAMS;
  private config: CustomConfig;
  private state: Map<string, any>;

  constructor(metadata: AppMetadata, config: CustomConfig, tams: TAMS) {
    super();
    this.metadata = metadata;
    this.tams = tams;
    this.config = config;
    this.state = new Map(Object.entries(config.state || {}));
  }

  async execute(command: string, args: any[]): Promise<any> {
    // Check if custom handler exists
    if (this.config.handlers[command]) {
      return await this.config.handlers[command].apply(this, args);
    }

    // Default commands
    const commands: Record<string, (...args: any[]) => Promise<any>> = {
      getState: (key?: string) => this.getState(key),
      setState: (key: string, value: any) => this.setState(key, value),
      addHandler: (name: string, fn: Function) => this.addHandler(name, fn),
    };

    const handler = commands[command];
    if (!handler) {
      throw new Error(`Unknown command: ${command}`);
    }

    return await handler(...args);
  }

  async tune(parameters: Record<string, any>): Promise<void> {
    console.log(`🎛️  Tuning custom app: ${this.metadata.name}`);

    this.config = {
      ...this.config,
      ...parameters,
    };

    this.metadata.config = this.config;
    this.metadata.updated = new Date();

    this.emit('tuned', parameters);
  }

  async clone(overrides?: Partial<AppMetadata>): Promise<AppInstance> {
    console.log(`🧬 Cloning custom app: ${this.metadata.name}`);

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
    return new CustomApp(clonedMetadata, clonedConfig, this.tams);
  }

  async update(): Promise<void> {
    console.log(`⬆️  Updating custom app: ${this.metadata.name}`);

    this.metadata.version = this.incrementVersion(this.metadata.version);
    this.emit('updated', this.metadata.version);
  }

  async destroy(): Promise<void> {
    console.log(`🗑️  Destroying custom app: ${this.metadata.name}`);
    this.removeAllListeners();
  }

  // Custom app methods

  private async getState(key?: string): Promise<any> {
    if (key) {
      return this.state.get(key);
    }
    return Object.fromEntries(this.state.entries());
  }

  private async setState(key: string, value: any): Promise<void> {
    this.state.set(key, value);
    this.emit('state:changed', { key, value });
  }

  private async addHandler(name: string, fn: Function): Promise<void> {
    this.config.handlers[name] = fn;
    console.log(`➕ Added handler: ${name}`);
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
  const customConfig: CustomConfig = {
    handlers: config?.handlers || {},
    state: config?.state || {},
    features: config?.features || [],
  };

  return new CustomApp(metadata, customConfig, tams);
}
