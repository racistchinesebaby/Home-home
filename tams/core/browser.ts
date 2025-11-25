/**
 * Browser Integration
 * Connect TAMS with browser for web-based management and visualization
 */

import * as http from 'http';
import type { TAMS } from './index';

export interface BrowserConfig {
  port: number;
  host: string;
  enableCORS: boolean;
  staticPath?: string;
}

export class BrowserIntegration {
  private tams: TAMS;
  private config: BrowserConfig;
  private server?: http.Server;

  constructor(tams: TAMS, config?: Partial<BrowserConfig>) {
    this.tams = tams;
    this.config = {
      port: config?.port || 3001,
      host: config?.host || 'localhost',
      enableCORS: config?.enableCORS ?? true,
      staticPath: config?.staticPath,
    };
  }

  async start(): Promise<void> {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });

    return new Promise((resolve, reject) => {
      this.server!.listen(this.config.port, this.config.host, () => {
        console.log(`🌐 Browser interface: http://${this.config.host}:${this.config.port}`);
        resolve();
      });

      this.server!.on('error', reject);
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      return new Promise(resolve => {
        this.server!.close(() => resolve());
      });
    }
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    // CORS headers
    if (this.config.enableCORS) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
    }

    const url = new URL(req.url!, `http://${req.headers.host}`);
    const path = url.pathname;

    try {
      // API Routes
      if (path.startsWith('/api/')) {
        await this.handleApiRequest(req, res, path);
      }
      // Static files or SPA
      else {
        await this.handleStaticRequest(req, res, path);
      }
    } catch (error: any) {
      console.error('Request error:', error);
      this.sendJSON(res, 500, { error: error.message });
    }
  }

  private async handleApiRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    path: string
  ): Promise<void> {
    const method = req.method || 'GET';

    // Parse body for POST/PUT
    let body: any = {};
    if (method === 'POST' || method === 'PUT') {
      body = await this.parseBody(req);
    }

    // Route handling
    if (path === '/api/status' && method === 'GET') {
      const status = this.tams.getStatus();
      this.sendJSON(res, 200, status);
    } else if (path === '/api/apps' && method === 'GET') {
      const apps = this.tams.listApps();
      this.sendJSON(res, 200, apps);
    } else if (path === '/api/apps' && method === 'POST') {
      const app = await this.tams.createApp(body.type, body.name, body.config);
      this.sendJSON(res, 201, app.metadata);
    } else if (path.startsWith('/api/apps/') && method === 'GET') {
      const appId = path.split('/')[3];
      const apps = this.tams.listApps();
      const app = apps.find(a => a.id === appId);

      if (app) {
        this.sendJSON(res, 200, app);
      } else {
        this.sendJSON(res, 404, { error: 'App not found' });
      }
    } else if (path.startsWith('/api/apps/') && path.endsWith('/execute') && method === 'POST') {
      const appId = path.split('/')[3];
      const result = await this.tams.executeApp(appId, body.command, body.args || []);
      this.sendJSON(res, 200, { result });
    } else if (path.startsWith('/api/apps/') && path.endsWith('/tune') && method === 'POST') {
      const appId = path.split('/')[3];
      await this.tams.tuneApp(appId, body.parameters);
      this.sendJSON(res, 200, { success: true });
    } else if (path.startsWith('/api/apps/') && path.endsWith('/clone') && method === 'POST') {
      const appId = path.split('/')[3];
      const clone = await this.tams.cloneApp(appId, body.overrides);
      this.sendJSON(res, 201, clone.metadata);
    } else if (path.startsWith('/api/apps/') && method === 'DELETE') {
      const appId = path.split('/')[3];
      await this.tams.removeApp(appId);
      this.sendJSON(res, 200, { success: true });
    } else if (path === '/api/store/search' && method === 'GET') {
      const query = new URL(req.url!, `http://${req.headers.host}`).searchParams.get('q') || '';
      const results = await this.tams.searchStore(query);
      this.sendJSON(res, 200, results);
    } else if (path === '/api/store/install' && method === 'POST') {
      const app = await this.tams.installApp(body.appId, body.config);
      this.sendJSON(res, 201, app.metadata);
    } else {
      this.sendJSON(res, 404, { error: 'Not found' });
    }
  }

  private async handleStaticRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    path: string
  ): Promise<void> {
    // Serve a simple dashboard HTML
    const html = this.getDashboardHTML();

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  private getDashboardHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TAMS - Terminal App Management System</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #000;
      color: #fff;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { font-size: 2.5rem; margin-bottom: 10px; }
    .subtitle { color: #888; margin-bottom: 30px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background: #111;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #333;
    }
    .stat-card h3 { color: #888; font-size: 0.9rem; margin-bottom: 10px; }
    .stat-card .value { font-size: 2rem; font-weight: bold; }
    .apps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }
    .app-card {
      background: #111;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #333;
    }
    .app-card h3 { margin-bottom: 10px; }
    .app-card .meta { color: #888; font-size: 0.9rem; margin-bottom: 10px; }
    .status {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: bold;
    }
    .status.active { background: #0a0; color: #000; }
    .status.error { background: #a00; color: #fff; }
    .status.tuning { background: #aa0; color: #000; }
    button {
      background: #fff;
      color: #000;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 10px;
      font-weight: bold;
    }
    button:hover { background: #ccc; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 TAMS</h1>
    <div class="subtitle">Terminal App Management System</div>

    <div class="stats" id="stats">
      <div class="stat-card">
        <h3>TOTAL APPS</h3>
        <div class="value" id="total-apps">-</div>
      </div>
      <div class="stat-card">
        <h3>ACTIVE APPS</h3>
        <div class="value" id="active-apps">-</div>
      </div>
      <div class="stat-card">
        <h3>AGENT STATUS</h3>
        <div class="value" id="agent-status">-</div>
      </div>
      <div class="stat-card">
        <h3>UPTIME</h3>
        <div class="value" id="uptime">-</div>
      </div>
    </div>

    <h2>Apps</h2>
    <div class="apps-grid" id="apps"></div>
  </div>

  <script>
    async function fetchStatus() {
      const res = await fetch('/api/status');
      const status = await res.json();

      document.getElementById('total-apps').textContent = status.apps.total;
      document.getElementById('active-apps').textContent = status.apps.byStatus.active || 0;
      document.getElementById('agent-status').textContent = status.agent.running ? 'Running' : 'Stopped';
      document.getElementById('uptime').textContent = Math.floor(status.system.uptime) + 's';
    }

    async function fetchApps() {
      const res = await fetch('/api/apps');
      const apps = await res.json();

      const container = document.getElementById('apps');
      container.innerHTML = apps.map(app => \`
        <div class="app-card">
          <h3>\${app.name}</h3>
          <div class="meta">
            <span class="status \${app.status}">\${app.status.toUpperCase()}</span>
            <span>Type: \${app.type}</span>
            <span>v\${app.version}</span>
          </div>
          <div class="meta" style="margin-top: 10px;">
            <div>ID: \${app.id}</div>
            <div>Updated: \${new Date(app.updated).toLocaleString()}</div>
          </div>
          <div style="margin-top: 15px;">
            <button onclick="tuneApp('\${app.id}')">Tune</button>
            <button onclick="cloneApp('\${app.id}')">Clone</button>
            <button onclick="removeApp('\${app.id}')">Remove</button>
          </div>
        </div>
      \`).join('');
    }

    async function tuneApp(id) {
      await fetch(\`/api/apps/\${id}/tune\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      alert('App tuning started!');
      fetchApps();
    }

    async function cloneApp(id) {
      await fetch(\`/api/apps/\${id}/clone\`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      alert('App cloned!');
      fetchApps();
    }

    async function removeApp(id) {
      if (confirm('Remove this app?')) {
        await fetch(\`/api/apps/\${id}\`, { method: 'DELETE' });
        fetchApps();
      }
    }

    // Initial load
    fetchStatus();
    fetchApps();

    // Refresh every 5 seconds
    setInterval(() => {
      fetchStatus();
      fetchApps();
    }, 5000);
  </script>
</body>
</html>`;
  }

  private parseBody(req: http.IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = '';

      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          resolve(JSON.parse(body || '{}'));
        } catch (error) {
          reject(new Error('Invalid JSON'));
        }
      });

      req.on('error', reject);
    });
  }

  private sendJSON(res: http.ServerResponse, status: number, data: any): void {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }
}
