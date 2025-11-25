/**
 * AI CLI Commands
 * Interactive AI commands for TAMS CLI
 */

import * as chalk from 'chalk';
import type { TAMS } from '../core/index';

export function createAICommands(tams: TAMS) {
  return {
    ai: {
      name: 'ai',
      description: 'Interact with AI assistants',
      usage: 'ai [gemini|agent|tuner] MESSAGE',
      handler: async (...args: string[]) => {
        if (args.length === 0) {
          console.log(chalk.cyan('\n🤖 Available AIs:\n'));
          const ais = tams.getAIs();

          for (const ai of ais) {
            console.log(`  ${chalk.bold(ai.getName())}`);
            console.log(`    Provider: ${ai.getProvider()}`);
            console.log(`    Model: ${ai.getModel()}`);
            console.log();
          }

          console.log(chalk.gray('Usage: ai [gemini|agent|tuner] "your message"'));
          return;
        }

        const aiId = args[0];
        const message = args.slice(1).join(' ');

        if (!message) {
          console.log(chalk.red('Error: Message is required'));
          console.log(chalk.gray('Usage: ai [gemini|agent|tuner] "your message"'));
          return;
        }

        try {
          const response = await tams.chatWithAI(aiId, message);

          console.log(chalk.cyan(`\n💬 ${response.content}\n`));

          if (response.action) {
            console.log(chalk.yellow(`Suggested action: ${response.action.type}`));
            console.log(chalk.gray(`Parameters: ${JSON.stringify(response.action.parameters, null, 2)}`));
          }

          if (response.confidence) {
            console.log(chalk.gray(`Confidence: ${(response.confidence * 100).toFixed(0)}%\n`));
          }
        } catch (error: any) {
          console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
        }
      },
    },

    gemini: {
      name: 'gemini',
      description: 'Chat with Gemini AI',
      usage: 'gemini MESSAGE [--app APP_ID]',
      handler: async (...args: string[]) => {
        if (args.length === 0) {
          console.log(chalk.red('Error: Message is required'));
          return;
        }

        const appIndex = args.indexOf('--app');
        const appId = appIndex !== -1 && args[appIndex + 1] ? args[appIndex + 1] : undefined;

        const messageArgs = appIndex !== -1 ? args.slice(0, appIndex) : args;
        const message = messageArgs.join(' ');

        try {
          const response = await tams.chatWithAI('gemini', message, { appId });

          console.log(chalk.cyan(`\n🔮 Gemini AI:\n`));
          console.log(response.content);
          console.log();

          if (response.action) {
            console.log(chalk.yellow(`\n💡 Suggested action: ${response.action.type}`));
          }
        } catch (error: any) {
          console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
        }
      },
    },

    agent: {
      name: 'agent',
      description: 'Interact with Background Agent AI',
      usage: 'agent [status|tasks|MESSAGE]',
      handler: async (...args: string[]) => {
        const message = args.join(' ') || 'status';

        try {
          const response = await tams.chatWithAI('background-agent', message);

          console.log(chalk.cyan(`\n🤖 Background Agent:\n`));
          console.log(response.content);
          console.log();
        } catch (error: any) {
          console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
        }
      },
    },

    tuner: {
      name: 'tuner',
      description: 'Interact with Meta-Tuner AI',
      usage: 'tuner MESSAGE [--app APP_ID]',
      handler: async (...args: string[]) => {
        if (args.length === 0) {
          console.log(chalk.red('Error: Message is required'));
          return;
        }

        const appIndex = args.indexOf('--app');
        const appId = appIndex !== -1 && args[appIndex + 1] ? args[appIndex + 1] : undefined;

        const messageArgs = appIndex !== -1 ? args.slice(0, appIndex) : args;
        const message = messageArgs.join(' ');

        try {
          const response = await tams.chatWithAI('meta-tuner', message, { appId });

          console.log(chalk.cyan(`\n🎛️  Meta-Tuner AI:\n`));
          console.log(response.content);
          console.log();

          if (response.action) {
            console.log(chalk.yellow(`\n💡 Recommended: ${response.action.type}`));
          }
        } catch (error: any) {
          console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
        }
      },
    },

    ask: {
      name: 'ask',
      description: 'Ask all AIs and get collaborative response',
      usage: 'ask MESSAGE [--app APP_ID]',
      handler: async (...args: string[]) => {
        if (args.length === 0) {
          console.log(chalk.red('Error: Message is required'));
          return;
        }

        const appIndex = args.indexOf('--app');
        const appId = appIndex !== -1 && args[appIndex + 1] ? args[appIndex + 1] : undefined;

        const messageArgs = appIndex !== -1 ? args.slice(0, appIndex) : args;
        const message = messageArgs.join(' ');

        console.log(chalk.cyan('\n🧠 Consulting all AIs...\n'));

        try {
          const decision = await tams.ai.collaborativeDecision(message, {
            appId,
            conversationHistory: [],
            capabilities: [],
          });

          console.log(chalk.bold.green('Consensus:\n'));
          console.log(decision.consensus);
          console.log();

          console.log(chalk.bold.cyan('Individual Responses:\n'));
          for (const [aiId, response] of decision.individual.entries()) {
            console.log(chalk.yellow(`${aiId}:`));
            console.log(response.content);
            console.log();
          }

          console.log(chalk.gray(`Overall confidence: ${(decision.confidence * 100).toFixed(0)}%\n`));
        } catch (error: any) {
          console.log(chalk.red(`\n❌ Error: ${error.message}\n`));
        }
      },
    },
  };
}
