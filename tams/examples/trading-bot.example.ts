/**
 * Example: Creating and managing a trading algorithm
 */

import { TAMS } from '../core/index';

async function tradingBotExample() {
  const tams = new TAMS();

  // Wait for system to initialize
  await new Promise(resolve => {
    tams.once('system:ready', resolve);
  });

  console.log('Creating trading bot...');

  // Create a trading bot
  const bot = await tams.createApp('trading', 'BTC Scalper', {
    strategy: 'scalping',
    pairs: ['BTC/USD', 'ETH/USD'],
    timeframe: '5m',
    indicators: ['SMA', 'EMA', 'RSI', 'MACD'],
    riskManagement: {
      maxPositionSize: 0.05,
      stopLoss: 0.01,
      takeProfit: 0.03,
    },
    execution: {
      orderType: 'limit',
      timeout: 3000,
      retries: 5,
    },
  });

  console.log(`Created bot: ${bot.metadata.id}`);

  // Backtest the strategy
  console.log('Running backtest...');
  const backtestResults = await tams.executeApp(bot.metadata.id, 'backtest', [
    { period: '2024-01', data: 'historical-data.json' },
  ]);

  console.log('Backtest results:', backtestResults);

  // If backtest is good, tune the bot
  if (backtestResults.profitFactor > 1.5) {
    console.log('Tuning bot for better performance...');
    await tams.tuneApp(bot.metadata.id);
  }

  // Clone the bot for different pairs
  console.log('Cloning bot for ETH...');
  const ethBot = await tams.cloneApp(bot.metadata.id, {
    name: 'ETH Scalper',
  });

  // Start trading (simulation)
  console.log('Starting trading...');
  await tams.executeApp(bot.metadata.id, 'start');

  // Monitor performance
  setTimeout(async () => {
    const performance = await tams.executeApp(bot.metadata.id, 'getPerformance');
    console.log('Performance:', performance);

    // Get current positions
    const positions = await tams.executeApp(bot.metadata.id, 'getPositions');
    console.log('Positions:', positions);
  }, 5000);

  // The background agent will automatically:
  // - Monitor the bot's performance
  // - Optimize parameters
  // - Heal any errors
  // - Suggest improvements

  console.log('Bot is running! Background agent will monitor and optimize.');
}

// Run the example
if (require.main === module) {
  tradingBotExample().catch(console.error);
}

export default tradingBotExample;
