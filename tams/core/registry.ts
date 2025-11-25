/**
 * App Registry
 * Manages app metadata and persistence
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import { AppMetadata } from './index';

export class AppRegistry {
  private registryPath: string;
  private apps: Map<string, AppMetadata>;

  constructor(basePath: string = path.join(process.cwd(), '.tams')) {
    this.registryPath = path.join(basePath, 'registry.json');
    this.apps = new Map();
  }

  async load(): Promise<void> {
    try {
      await fs.ensureFile(this.registryPath);
      const data = await fs.readJSON(this.registryPath, { throws: false }) || [];

      for (const metadata of data) {
        this.apps.set(metadata.id, {
          ...metadata,
          created: new Date(metadata.created),
          updated: new Date(metadata.updated),
        });
      }

      console.log(`📚 Loaded ${this.apps.size} apps from registry`);
    } catch (error) {
      console.error('Failed to load registry:', error);
      throw error;
    }
  }

  async save(): Promise<void> {
    try {
      const data = Array.from(this.apps.values());
      await fs.writeJSON(this.registryPath, data, { spaces: 2 });
    } catch (error) {
      console.error('Failed to save registry:', error);
      throw error;
    }
  }

  async register(metadata: AppMetadata): Promise<void> {
    this.apps.set(metadata.id, metadata);
    await this.save();
  }

  async update(metadata: AppMetadata): Promise<void> {
    if (!this.apps.has(metadata.id)) {
      throw new Error(`App not registered: ${metadata.id}`);
    }
    this.apps.set(metadata.id, metadata);
    await this.save();
  }

  async unregister(appId: string): Promise<void> {
    this.apps.delete(appId);
    await this.save();
  }

  get(appId: string): AppMetadata | undefined {
    return this.apps.get(appId);
  }

  getAll(): AppMetadata[] {
    return Array.from(this.apps.values());
  }

  find(predicate: (metadata: AppMetadata) => boolean): AppMetadata[] {
    return this.getAll().filter(predicate);
  }
}
