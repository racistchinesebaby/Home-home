/**
 * Research Forum App
 * Collaborative research platform with bounties and knowledge sharing
 */

import { EventEmitter } from 'events';
import type { AppMetadata, AppInstance, TAMS } from '../index';

export interface ResearchConfig {
  features: string[];
  authentication: 'oauth2' | 'jwt' | 'basic';
  storage: 'mongodb' | 'postgres' | 'filesystem';
  bounties: {
    enabled: boolean;
    minBounty: number;
    currency: string;
  };
  collaboration: {
    maxConcurrentUsers: number;
    autoSaveInterval: number;
    versionControl: boolean;
  };
}

interface Topic {
  id: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  bounty?: number;
  status: 'open' | 'in-progress' | 'resolved';
  created: Date;
  updated: Date;
}

interface Contribution {
  id: string;
  topicId: string;
  author: string;
  content: string;
  upvotes: number;
  created: Date;
}

class ResearchApp extends EventEmitter implements AppInstance {
  metadata: AppMetadata;
  private tams: TAMS;
  private config: ResearchConfig;
  private topics: Map<string, Topic>;
  private contributions: Map<string, Contribution>;
  private bounties: Map<string, number>;

  constructor(metadata: AppMetadata, config: ResearchConfig, tams: TAMS) {
    super();
    this.metadata = metadata;
    this.tams = tams;
    this.config = config;
    this.topics = new Map();
    this.contributions = new Map();
    this.bounties = new Map();
  }

  async execute(command: string, args: any[]): Promise<any> {
    const commands: Record<string, (...args: any[]) => Promise<any>> = {
      createTopic: (data: any) => this.createTopic(data),
      getTopic: (id: string) => this.getTopic(id),
      listTopics: (filters?: any) => this.listTopics(filters),
      addContribution: (data: any) => this.addContribution(data),
      createBounty: (topicId: string, amount: number) => this.createBounty(topicId, amount),
      resolveBounty: (topicId: string, contributionId: string) => this.resolveBounty(topicId, contributionId),
      search: (query: string) => this.search(query),
      getStats: () => this.getStats(),
    };

    const handler = commands[command];
    if (!handler) {
      throw new Error(`Unknown command: ${command}`);
    }

    return await handler(...args);
  }

  async tune(parameters: Record<string, any>): Promise<void> {
    console.log(`🎛️  Tuning research forum: ${this.metadata.name}`);

    this.config = {
      ...this.config,
      ...parameters,
    };

    this.metadata.config = this.config;
    this.metadata.updated = new Date();

    this.emit('tuned', parameters);
  }

  async clone(overrides?: Partial<AppMetadata>): Promise<AppInstance> {
    console.log(`🧬 Cloning research forum: ${this.metadata.name}`);

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
    return new ResearchApp(clonedMetadata, clonedConfig, this.tams);
  }

  async update(): Promise<void> {
    console.log(`⬆️  Updating research forum: ${this.metadata.name}`);

    this.metadata.version = this.incrementVersion(this.metadata.version);
    this.emit('updated', this.metadata.version);
  }

  async destroy(): Promise<void> {
    console.log(`🗑️  Destroying research forum: ${this.metadata.name}`);
    this.removeAllListeners();
  }

  // Research-specific methods

  private async createTopic(data: {
    title: string;
    description: string;
    author: string;
    tags: string[];
    bounty?: number;
  }): Promise<Topic> {
    const topic: Topic = {
      id: `topic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: data.title,
      description: data.description,
      author: data.author,
      tags: data.tags,
      bounty: data.bounty,
      status: 'open',
      created: new Date(),
      updated: new Date(),
    };

    this.topics.set(topic.id, topic);

    if (data.bounty && data.bounty > 0) {
      this.bounties.set(topic.id, data.bounty);
    }

    this.emit('topic:created', topic);
    console.log(`📝 Created topic: ${topic.title}`);

    return topic;
  }

  private async getTopic(id: string): Promise<Topic> {
    const topic = this.topics.get(id);
    if (!topic) {
      throw new Error(`Topic not found: ${id}`);
    }
    return topic;
  }

  private async listTopics(filters?: {
    status?: string;
    tags?: string[];
    bountyOnly?: boolean;
  }): Promise<Topic[]> {
    let topics = Array.from(this.topics.values());

    if (filters?.status) {
      topics = topics.filter(t => t.status === filters.status);
    }

    if (filters?.tags && filters.tags.length > 0) {
      topics = topics.filter(t => filters.tags!.some(tag => t.tags.includes(tag)));
    }

    if (filters?.bountyOnly) {
      topics = topics.filter(t => t.bounty && t.bounty > 0);
    }

    return topics.sort((a, b) => b.created.getTime() - a.created.getTime());
  }

  private async addContribution(data: {
    topicId: string;
    author: string;
    content: string;
  }): Promise<Contribution> {
    const topic = this.topics.get(data.topicId);
    if (!topic) {
      throw new Error(`Topic not found: ${data.topicId}`);
    }

    const contribution: Contribution = {
      id: `contrib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      topicId: data.topicId,
      author: data.author,
      content: data.content,
      upvotes: 0,
      created: new Date(),
    };

    this.contributions.set(contribution.id, contribution);

    topic.updated = new Date();
    if (topic.status === 'open') {
      topic.status = 'in-progress';
    }

    this.emit('contribution:added', contribution);
    console.log(`💡 Added contribution to: ${topic.title}`);

    return contribution;
  }

  private async createBounty(topicId: string, amount: number): Promise<void> {
    const topic = this.topics.get(topicId);
    if (!topic) {
      throw new Error(`Topic not found: ${topicId}`);
    }

    if (amount < this.config.bounties.minBounty) {
      throw new Error(`Bounty must be at least ${this.config.bounties.minBounty}`);
    }

    topic.bounty = (topic.bounty || 0) + amount;
    this.bounties.set(topicId, topic.bounty);

    this.emit('bounty:created', { topicId, amount });
    console.log(`💰 Added bounty of ${amount} to: ${topic.title}`);
  }

  private async resolveBounty(topicId: string, contributionId: string): Promise<void> {
    const topic = this.topics.get(topicId);
    const contribution = this.contributions.get(contributionId);

    if (!topic || !contribution) {
      throw new Error('Topic or contribution not found');
    }

    const bountyAmount = this.bounties.get(topicId);
    if (!bountyAmount) {
      throw new Error('No bounty available for this topic');
    }

    topic.status = 'resolved';
    this.bounties.delete(topicId);

    this.emit('bounty:resolved', {
      topicId,
      contributionId,
      amount: bountyAmount,
      winner: contribution.author,
    });

    console.log(`🏆 Bounty resolved: ${bountyAmount} awarded to ${contribution.author}`);
  }

  private async search(query: string): Promise<{
    topics: Topic[];
    contributions: Contribution[];
  }> {
    const lowerQuery = query.toLowerCase();

    const topics = Array.from(this.topics.values()).filter(
      t =>
        t.title.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );

    const contributions = Array.from(this.contributions.values()).filter(c =>
      c.content.toLowerCase().includes(lowerQuery)
    );

    return { topics, contributions };
  }

  private getStats(): any {
    const topics = Array.from(this.topics.values());
    const contributions = Array.from(this.contributions.values());

    return {
      totalTopics: topics.length,
      topicsByStatus: {
        open: topics.filter(t => t.status === 'open').length,
        inProgress: topics.filter(t => t.status === 'in-progress').length,
        resolved: topics.filter(t => t.status === 'resolved').length,
      },
      totalContributions: contributions.length,
      totalBounties: this.bounties.size,
      totalBountyAmount: Array.from(this.bounties.values()).reduce((sum, amount) => sum + amount, 0),
    };
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
  const researchConfig: ResearchConfig = {
    features: config?.features || ['discussions', 'bounties', 'voting', 'reputation'],
    authentication: config?.authentication || 'oauth2',
    storage: config?.storage || 'mongodb',
    bounties: config?.bounties || {
      enabled: true,
      minBounty: 10,
      currency: 'USD',
    },
    collaboration: config?.collaboration || {
      maxConcurrentUsers: 50,
      autoSaveInterval: 30000,
      versionControl: true,
    },
  };

  return new ResearchApp(metadata, researchConfig, tams);
}
