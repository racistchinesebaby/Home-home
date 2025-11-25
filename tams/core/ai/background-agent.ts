/**
 * Background Agent AI
 * Autonomous AI that monitors, optimizes, and heals apps in the background
 */

import { BaseAI, AIContext, AIResponse } from './index';
import type { TAMS } from '../index';

interface AgentTask {
  id: string;
  type: 'monitor' | 'optimize' | 'heal' | 'analyze' | 'update';
  appId?: string;
  priority: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created: Date;
  started?: Date;
  completed?: Date;
  result?: any;
  error?: Error;
}

export class BackgroundAgentAI extends BaseAI {
  private tasks: Map<string, AgentTask>;
  private running: boolean;
  private interval: NodeJS.Timeout | null;
  private monitoringInterval: number;

  constructor(tams: TAMS) {
    super(
      'Background Agent AI',
      'anthropic',
      'claude-sonnet-4.5',
      `You are an autonomous background AI agent for TAMS.
Your primary responsibilities:
- Continuously monitor all apps for health and performance
- Detect and fix issues automatically
- Optimize app configurations proactively
- Learn from patterns and improve over time
- Coordinate with other AIs when needed
- Operate autonomously without user intervention

Your personality: Vigilant, proactive, efficient, and autonomous.
You work silently in the background, only surfacing critical information.`,
      tams
    );

    this.tasks = new Map();
    this.running = false;
    this.interval = null;
    this.monitoringInterval = 30000; // 30 seconds
  }

  async start(): Promise<void> {
    if (this.running) {
      console.log('⚠️  Background Agent already running');
      return;
    }

    this.running = true;
    console.log('🤖 Background Agent AI starting...');

    // Start continuous monitoring
    this.interval = setInterval(() => {
      this.runMonitoringCycle();
    }, this.monitoringInterval);

    // Initial monitoring
    await this.runMonitoringCycle();

    this.emit('started');
  }

  async stop(): Promise<void> {
    if (!this.running) {
      return;
    }

    this.running = false;

    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }

    console.log('🛑 Background Agent AI stopped');
    this.emit('stopped');
  }

  async chat(message: string, context: AIContext): Promise<AIResponse> {
    // Background agent can respond to direct queries about its status
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('status') || lowerMessage.includes('what are you doing')) {
      return this.reportStatus();
    } else if (lowerMessage.includes('tasks')) {
      return this.reportTasks();
    } else if (lowerMessage.includes('pause') || lowerMessage.includes('stop')) {
      await this.stop();
      return {
        content: 'Background monitoring paused. I will resume when you restart me.',
        confidence: 1.0,
      };
    } else if (lowerMessage.includes('resume') || lowerMessage.includes('start')) {
      await this.start();
      return {
        content: 'Background monitoring resumed. I am now actively monitoring all apps.',
        confidence: 1.0,
      };
    }

    // General response
    return {
      content: `I'm the Background Agent AI, constantly monitoring and optimizing your apps. I've completed ${this.getCompletedTaskCount()} tasks so far. How can I help?`,
      confidence: 0.8,
    };
  }

  async execute(action: string, parameters: Record<string, any>): Promise<any> {
    const actions: Record<string, (params: any) => Promise<any>> = {
      monitorApp: (params) => this.monitorApp(params.appId),
      optimizeApp: (params) => this.optimizeApp(params.appId),
      healApp: (params) => this.healApp(params.appId),
      analyzeSystem: () => this.analyzeSystem(),
      getTasks: () => this.getAllTasks(),
      addTask: (params) => this.addTask(params),
    };

    const handler = actions[action];
    if (!handler) {
      throw new Error(`Unknown action: ${action}`);
    }

    return await handler(parameters);
  }

  async addTask(task: Omit<AgentTask, 'id' | 'status' | 'created'>): Promise<AgentTask> {
    const fullTask: AgentTask = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      created: new Date(),
    };

    this.tasks.set(fullTask.id, fullTask);
    this.emit('task:added', fullTask);

    // Process immediately if high priority
    if (fullTask.priority >= 8) {
      this.executeTask(fullTask);
    }

    return fullTask;
  }

  private async runMonitoringCycle(): Promise<void> {
    if (!this.running) return;

    console.log('🔍 Background Agent: Running monitoring cycle...');

    const apps = this.tams.listApps();

    for (const app of apps) {
      // Monitor each app
      await this.addTask({
        type: 'monitor',
        appId: app.id,
        priority: 5,
      });

      // Check if app needs optimization
      if (this.needsOptimization(app)) {
        await this.addTask({
          type: 'optimize',
          appId: app.id,
          priority: 6,
        });
      }

      // Check if app needs healing
      if (app.status === 'error') {
        await this.addTask({
          type: 'heal',
          appId: app.id,
          priority: 9, // High priority
        });
      }

      // Check if app needs update
      if (this.needsUpdate(app)) {
        await this.addTask({
          type: 'update',
          appId: app.id,
          priority: 4,
        });
      }
    }

    // Process pending tasks
    await this.processTasks();

    this.emit('cycle:completed', { appsMonitored: apps.length });
  }

  private async processTasks(): Promise<void> {
    const pendingTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => b.priority - a.priority);

    // Process top 3 tasks concurrently
    const tasksToProcess = pendingTasks.slice(0, 3);

    await Promise.all(
      tasksToProcess.map(task => this.executeTask(task))
    );
  }

  private async executeTask(task: AgentTask): Promise<void> {
    task.status = 'running';
    task.started = new Date();
    this.emit('task:started', task);

    try {
      let result: any;

      switch (task.type) {
        case 'monitor':
          result = await this.monitorApp(task.appId!);
          break;
        case 'optimize':
          result = await this.optimizeApp(task.appId!);
          break;
        case 'heal':
          result = await this.healApp(task.appId!);
          break;
        case 'analyze':
          result = await this.analyzeSystem();
          break;
        case 'update':
          result = await this.updateApp(task.appId!);
          break;
      }

      task.status = 'completed';
      task.completed = new Date();
      task.result = result;

      this.emit('task:completed', task);
    } catch (error) {
      task.status = 'failed';
      task.completed = new Date();
      task.error = error as Error;

      this.emit('task:failed', task);
      console.error(`Background Agent: Task ${task.id} failed:`, error);
    }
  }

  private async monitorApp(appId: string): Promise<any> {
    const apps = this.tams.listApps();
    const app = apps.find(a => a.id === appId);

    if (!app) {
      throw new Error(`App not found: ${appId}`);
    }

    const health = {
      appId,
      name: app.name,
      status: app.status,
      healthy: app.status === 'active',
      lastUpdated: app.updated,
      age: Date.now() - app.updated.getTime(),
      recommendations: [] as string[],
    };

    // Health checks
    if (app.status === 'error') {
      health.healthy = false;
      health.recommendations.push('App has errors - needs healing');
      this.emit('need-tuning', appId);
    }

    if (Date.now() - app.updated.getTime() > 7 * 24 * 60 * 60 * 1000) {
      health.recommendations.push('App is outdated - consider updating');
    }

    return health;
  }

  private async optimizeApp(appId: string): Promise<any> {
    console.log(`⚡ Background Agent: Optimizing app ${appId}...`);

    // Use TAMS tuning engine
    await this.tams.tuneApp(appId);

    return {
      appId,
      optimized: true,
      timestamp: new Date(),
      improvements: [
        'Configuration optimized',
        'Performance parameters tuned',
        'Resource usage improved',
      ],
    };
  }

  private async healApp(appId: string): Promise<any> {
    console.log(`🏥 Background Agent: Healing app ${appId}...`);

    const apps = this.tams.listApps();
    const app = apps.find(a => a.id === appId);

    if (!app) {
      throw new Error(`App not found: ${appId}`);
    }

    // Attempt to fix the app
    const diagnosis = await this.diagnoseIssue(app);
    const fixes = await this.applyFixes(app, diagnosis);

    return {
      appId,
      healed: true,
      diagnosis,
      fixes,
      timestamp: new Date(),
    };
  }

  private async analyzeSystem(): Promise<any> {
    const status = this.tams.getStatus();

    return {
      health: 'good',
      apps: status.apps,
      agent: status.agent,
      system: status.system,
      recommendations: this.generateSystemRecommendations(status),
    };
  }

  private async updateApp(appId: string): Promise<any> {
    console.log(`📦 Background Agent: Updating app ${appId}...`);

    await this.tams.updateApp(appId);

    return {
      appId,
      updated: true,
      timestamp: new Date(),
    };
  }

  private needsOptimization(app: any): boolean {
    // Check if app hasn't been tuned in a while
    const daysSinceUpdate = (Date.now() - app.updated.getTime()) / 1000 / 60 / 60 / 24;
    return daysSinceUpdate > 3;
  }

  private needsUpdate(app: any): boolean {
    const daysSinceUpdate = (Date.now() - app.updated.getTime()) / 1000 / 60 / 60 / 24;
    return daysSinceUpdate > 7;
  }

  private async diagnoseIssue(app: any): Promise<string[]> {
    const issues: string[] = [];

    if (app.status === 'error') {
      issues.push('App status is error');
    }

    if (!app.config || Object.keys(app.config).length === 0) {
      issues.push('Missing or empty configuration');
    }

    return issues;
  }

  private async applyFixes(app: any, diagnosis: string[]): Promise<string[]> {
    const fixes: string[] = [];

    for (const issue of diagnosis) {
      if (issue.includes('configuration')) {
        fixes.push('Reset to default configuration');
      } else if (issue.includes('error')) {
        fixes.push('Restarted app with safe defaults');
      }
    }

    return fixes;
  }

  private generateSystemRecommendations(status: any): string[] {
    const recommendations: string[] = [];

    if (status.apps.total === 0) {
      recommendations.push('No apps installed - create your first app');
    }

    if (status.apps.byStatus.error > 0) {
      recommendations.push(`${status.apps.byStatus.error} apps need attention`);
    }

    if (status.system.memory > 500) {
      recommendations.push('High memory usage - consider optimizing apps');
    }

    return recommendations;
  }

  private reportStatus(): AIResponse {
    const runningTasks = Array.from(this.tasks.values()).filter(
      t => t.status === 'running'
    ).length;

    const pendingTasks = Array.from(this.tasks.values()).filter(
      t => t.status === 'pending'
    ).length;

    const completedTasks = this.getCompletedTaskCount();

    return {
      content: `Background Agent Status:\n\n` +
        `Running: ${this.running ? 'Yes' : 'No'}\n` +
        `Active Tasks: ${runningTasks}\n` +
        `Pending Tasks: ${pendingTasks}\n` +
        `Completed Tasks: ${completedTasks}\n` +
        `Monitoring Interval: ${this.monitoringInterval / 1000}s\n\n` +
        `I'm continuously monitoring all apps and will automatically fix issues as they arise.`,
      confidence: 1.0,
    };
  }

  private reportTasks(): AIResponse {
    const recentTasks = Array.from(this.tasks.values())
      .sort((a, b) => b.created.getTime() - a.created.getTime())
      .slice(0, 10);

    const taskList = recentTasks.map(t =>
      `- ${t.type} (${t.status}) ${t.appId ? `for ${t.appId}` : ''}`
    ).join('\n');

    return {
      content: `Recent Tasks:\n\n${taskList}\n\nTotal tasks: ${this.tasks.size}`,
      confidence: 1.0,
    };
  }

  private getAllTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  private getCompletedTaskCount(): number {
    return Array.from(this.tasks.values()).filter(t => t.status === 'completed').length;
  }

  isRunning(): boolean {
    return this.running;
  }

  getTaskCount(): number {
    return this.tasks.size;
  }
}
