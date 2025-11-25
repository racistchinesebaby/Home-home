#!/usr/bin/env node

/**
 * TAMS CLI
 * Terminal interface for the App Management System
 */

import * as readline from 'readline';
import * as chalk from 'chalk';
import { TAMS } from '../core/index';

const tams = new TAMS();

interface Command {
  name: string;
  description: string;
  usage: string;
  handler: (...args: string[]) => Promise<void>;
}

const commands: Record<string, Command> = {
  help: {
    name: 'help',
    description: 'Show available commands',
    usage: 'help [command]',
    handler: async (cmd?: string) => {
      if (cmd && commands[cmd]) {
        console.log(chalk.cyan(`\n${commands[cmd].name} - ${commands[cmd].description}`));
        console.log(chalk.gray(`Usage: ${commands[cmd].usage}\n`));
      } else {
        console.log(chalk.cyan('\n📋 Available Commands:\n'));
        for (const [name, cmd] of Object.entries(commands)) {
          console.log(`  ${chalk.green(name.padEnd(15))} - ${cmd.description}`);
        }
        console.log();
      }
    },
  },

  status: {
    name: 'status',
    description: 'Show system status',
    usage: 'status',
    handler: async () => {
      const status = tams.getStatus();

      console.log(chalk.cyan('\n📊 System Status:\n'));
      console.log(`  Apps: ${status.apps.total}`);
      console.log(`    Trading: ${status.apps.byType.trading || 0}`);
      console.log(`    Research: ${status.apps.byType.research || 0}`);
      console.log(`    Tools: ${status.apps.byType.tool || 0}`);
      console.log(`    Integrations: ${status.apps.byType.integration || 0}`);
      console.log(`    Custom: ${status.apps.byType.custom || 0}`);
      console.log();
      console.log(`  Agent: ${status.agent.running ? chalk.green('Running') : chalk.red('Stopped')}`);
      console.log(`  Tasks: ${status.agent.tasks}`);
      console.log();
      console.log(`  Uptime: ${Math.floor(status.system.uptime)}s`);
      console.log(`  Memory: ${status.system.memory.toFixed(2)} MB\n`);
    },
  },

  list: {
    name: 'list',
    description: 'List installed apps',
    usage: 'list [--type TYPE] [--status STATUS]',
    handler: async (...args: string[]) => {
      const filters: any = {};

      for (let i = 0; i < args.length; i++) {
        if (args[i] === '--type' && args[i + 1]) {
          filters.type = args[i + 1];
          i++;
        } else if (args[i] === '--status' && args[i + 1]) {
          filters.status = args[i + 1];
          i++;
        }
      }

      const apps = tams.listApps(filters);

      if (apps.length === 0) {
        console.log(chalk.yellow('\nNo apps found.\n'));
        return;
      }

      console.log(chalk.cyan(`\n📱 Apps (${apps.length}):\n`));
      for (const app of apps) {
        const statusColor =
          app.status === 'active' ? chalk.green : app.status === 'error' ? chalk.red : chalk.yellow;

        console.log(`  ${chalk.bold(app.name)} (${app.id})`);
        console.log(`    Type: ${app.type} | Status: ${statusColor(app.status)} | Version: ${app.version}`);
        console.log(`    Origin: ${app.origin} | Updated: ${app.updated.toLocaleString()}`);
        console.log();
      }
    },
  },

  create: {
    name: 'create',
    description: 'Create a new app',
    usage: 'create TYPE NAME [--config JSON]',
    handler: async (type: string, name: string, ...args: string[]) => {
      if (!type || !name) {
        console.log(chalk.red('Error: TYPE and NAME are required'));
        console.log(chalk.gray('Usage: create TYPE NAME [--config JSON]'));
        return;
      }

      let config: any = {};
      const configIndex = args.indexOf('--config');
      if (configIndex !== -1 && args[configIndex + 1]) {
        try {
          config = JSON.parse(args[configIndex + 1]);
        } catch (error) {
          console.log(chalk.red('Error: Invalid JSON config'));
          return;
        }
      }

      try {
        const app = await tams.createApp(type as any, name, config);
        console.log(chalk.green(`\n✅ Created app: ${app.metadata.name} (${app.metadata.id})\n`));
      } catch (error: any) {
        console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
      }
    },
  },

  install: {
    name: 'install',
    description: 'Install an app from the store',
    usage: 'install APP_ID [--config JSON]',
    handler: async (appId: string, ...args: string[]) => {
      if (!appId) {
        console.log(chalk.red('Error: APP_ID is required'));
        return;
      }

      let config: any = {};
      const configIndex = args.indexOf('--config');
      if (configIndex !== -1 && args[configIndex + 1]) {
        try {
          config = JSON.parse(args[configIndex + 1]);
        } catch (error) {
          console.log(chalk.red('Error: Invalid JSON config'));
          return;
        }
      }

      try {
        const app = await tams.installApp(appId, config);
        console.log(chalk.green(`\n✅ Installed app: ${app.metadata.name} (${app.metadata.id})\n`));
      } catch (error: any) {
        console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
      }
    },
  },

  clone: {
    name: 'clone',
    description: 'Clone an existing app',
    usage: 'clone APP_ID [--name NAME]',
    handler: async (appId: string, ...args: string[]) => {
      if (!appId) {
        console.log(chalk.red('Error: APP_ID is required'));
        return;
      }

      const overrides: any = {};
      const nameIndex = args.indexOf('--name');
      if (nameIndex !== -1 && args[nameIndex + 1]) {
        overrides.name = args[nameIndex + 1];
      }

      try {
        const app = await tams.cloneApp(appId, overrides);
        console.log(chalk.green(`\n✅ Cloned app: ${app.metadata.name} (${app.metadata.id})\n`));
      } catch (error: any) {
        console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
      }
    },
  },

  tune: {
    name: 'tune',
    description: 'Tune an app with AI optimization',
    usage: 'tune APP_ID [--params JSON]',
    handler: async (appId: string, ...args: string[]) => {
      if (!appId) {
        console.log(chalk.red('Error: APP_ID is required'));
        return;
      }

      let params: any = {};
      const paramsIndex = args.indexOf('--params');
      if (paramsIndex !== -1 && args[paramsIndex + 1]) {
        try {
          params = JSON.parse(args[paramsIndex + 1]);
        } catch (error) {
          console.log(chalk.red('Error: Invalid JSON params'));
          return;
        }
      }

      try {
        await tams.tuneApp(appId, params);
        console.log(chalk.green(`\n✅ Tuned app: ${appId}\n`));
      } catch (error: any) {
        console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
      }
    },
  },

  update: {
    name: 'update',
    description: 'Update an app to latest version',
    usage: 'update APP_ID',
    handler: async (appId: string) => {
      if (!appId) {
        console.log(chalk.red('Error: APP_ID is required'));
        return;
      }

      try {
        await tams.updateApp(appId);
        console.log(chalk.green(`\n✅ Updated app: ${appId}\n`));
      } catch (error: any) {
        console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
      }
    },
  },

  execute: {
    name: 'execute',
    description: 'Execute a command on an app',
    usage: 'execute APP_ID COMMAND [ARGS...]',
    handler: async (appId: string, command: string, ...args: string[]) => {
      if (!appId || !command) {
        console.log(chalk.red('Error: APP_ID and COMMAND are required'));
        return;
      }

      try {
        const result = await tams.executeApp(appId, command, args);
        console.log(chalk.cyan('\n📤 Result:\n'));
        console.log(JSON.stringify(result, null, 2));
        console.log();
      } catch (error: any) {
        console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
      }
    },
  },

  remove: {
    name: 'remove',
    description: 'Remove an app',
    usage: 'remove APP_ID',
    handler: async (appId: string) => {
      if (!appId) {
        console.log(chalk.red('Error: APP_ID is required'));
        return;
      }

      try {
        await tams.removeApp(appId);
        console.log(chalk.green(`\n✅ Removed app: ${appId}\n`));
      } catch (error: any) {
        console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
      }
    },
  },

  store: {
    name: 'store',
    description: 'Search the app store',
    usage: 'store QUERY [--type TYPE] [--free]',
    handler: async (query: string, ...args: string[]) => {
      if (!query) {
        console.log(chalk.red('Error: QUERY is required'));
        return;
      }

      const filters: any = {};

      for (let i = 0; i < args.length; i++) {
        if (args[i] === '--type' && args[i + 1]) {
          filters.type = args[i + 1];
          i++;
        } else if (args[i] === '--free') {
          filters.free = true;
        }
      }

      try {
        const results = await tams.searchStore(query, filters);

        if (results.length === 0) {
          console.log(chalk.yellow('\nNo apps found.\n'));
          return;
        }

        console.log(chalk.cyan(`\n🏪 Store Results (${results.length}):\n`));
        for (const app of results) {
          console.log(`  ${chalk.bold(app.name)} (${app.id})`);
          console.log(`    ${app.description}`);
          console.log(
            `    Type: ${app.type} | Rating: ${app.rating}⭐ | Downloads: ${app.downloads}`
          );
          console.log(`    Price: ${app.price === 0 ? chalk.green('FREE') : `$${app.price}`}`);
          console.log();
        }
      } catch (error: any) {
        console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
      }
    },
  },

  exit: {
    name: 'exit',
    description: 'Exit TAMS',
    usage: 'exit',
    handler: async () => {
      console.log(chalk.cyan('\n👋 Shutting down TAMS...\n'));
      await tams.shutdown();
      process.exit(0);
    },
  },
};

async function handleCommand(input: string): Promise<void> {
  const parts = input.trim().split(/\s+/);
  const commandName = parts[0];
  const args = parts.slice(1);

  const command = commands[commandName];

  if (!command) {
    console.log(chalk.red(`Unknown command: ${commandName}`));
    console.log(chalk.gray('Type "help" for available commands'));
    return;
  }

  try {
    await command.handler(...args);
  } catch (error: any) {
    console.log(chalk.red(`Error: ${error.message}`));
  }
}

async function startCLI(): Promise<void> {
  console.log(chalk.bold.cyan('\n╔══════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║  Terminal App Management System (TAMS)      ║'));
  console.log(chalk.bold.cyan('║  Self-Replicating AI-Powered Apps           ║'));
  console.log(chalk.bold.cyan('╚══════════════════════════════════════════════╝\n'));

  console.log(chalk.gray('Type "help" for available commands\n'));

  // Wait for system to initialize
  await new Promise(resolve => {
    tams.once('system:ready', resolve);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: chalk.green('tams> '),
  });

  rl.prompt();

  rl.on('line', async (input: string) => {
    if (input.trim()) {
      await handleCommand(input);
    }
    rl.prompt();
  });

  rl.on('close', async () => {
    await commands.exit.handler();
  });
}

// Handle errors
process.on('uncaughtException', error => {
  console.error(chalk.red('\n💥 Uncaught Exception:'), error);
});

process.on('unhandledRejection', error => {
  console.error(chalk.red('\n💥 Unhandled Rejection:'), error);
});

// Start CLI
startCLI().catch(error => {
  console.error(chalk.red('Failed to start TAMS:'), error);
  process.exit(1);
});
