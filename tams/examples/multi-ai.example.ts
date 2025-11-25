/**
 * Example: Using Multiple AI Assistants
 * Demonstrates how Gemini, Background Agent, and Meta-Tuner work together
 */

import { TAMS } from '../core/index';

async function multiAIExample() {
  const tams = new TAMS();

  // Wait for system to initialize
  await new Promise(resolve => {
    tams.once('system:ready', resolve);
  });

  console.log('🤖 Multi-AI System Example\n');
  console.log('Demonstrating collaboration between Gemini, Background Agent, and Meta-Tuner\n');

  // ========================================
  // 1. Chat with Gemini AI
  // ========================================
  console.log('='.repeat(50));
  console.log('1. Gemini AI - General Purpose Assistant');
  console.log('='.repeat(50));

  const geminiResponse = await tams.chatWithAI('gemini', 'Help me create a trading bot');

  console.log('\n💬 Gemini says:');
  console.log(geminiResponse.content);
  console.log();

  // Create a trading bot based on Gemini's guidance
  const tradingBot = await tams.createApp('trading', 'AI Trading Bot', {
    strategy: 'moving-average-crossover',
    pairs: ['BTC/USD'],
  });

  console.log(`✅ Created trading bot: ${tradingBot.metadata.id}\n`);

  // ========================================
  // 2. Background Agent AI - Autonomous Monitoring
  // ========================================
  console.log('='.repeat(50));
  console.log('2. Background Agent AI - Autonomous Monitoring');
  console.log('='.repeat(50));

  // Check agent status
  const agentStatus = await tams.chatWithAI('background-agent', 'What are you monitoring?');

  console.log('\n🤖 Background Agent says:');
  console.log(agentStatus.content);
  console.log();

  // Background agent will automatically monitor the new trading bot
  console.log('⏰ Background Agent is now monitoring the trading bot...');
  console.log('   It will automatically:');
  console.log('   - Monitor health and performance');
  console.log('   - Fix issues if they arise');
  console.log('   - Suggest optimizations');
  console.log('   - Coordinate with Meta-Tuner when needed\n');

  // Wait a bit for monitoring
  await new Promise(resolve => setTimeout(resolve, 2000));

  // ========================================
  // 3. Meta-Tuner AI - Strategic Optimization
  // ========================================
  console.log('='.repeat(50));
  console.log('3. Meta-Tuner AI - Strategic App Optimization');
  console.log('='.repeat(50));

  // Ask Meta-Tuner for optimization suggestions
  const tunerSuggestions = await tams.chatWithAI(
    'meta-tuner',
    'What optimizations do you suggest?',
    { appId: tradingBot.metadata.id }
  );

  console.log('\n🎛️  Meta-Tuner says:');
  console.log(tunerSuggestions.content);
  console.log();

  // Apply optimizations
  console.log('⚡ Applying Meta-Tuner optimizations...');
  const tuningResult = await tams.ai.executeAI('meta-tuner', 'tuneApp', {
    appId: tradingBot.metadata.id,
  });

  console.log(`✅ Tuning complete! Improvement: ${tuningResult.improvement || 'N/A'}\n`);

  // ========================================
  // 4. Collaborative AI Decision
  // ========================================
  console.log('='.repeat(50));
  console.log('4. Collaborative AI - All AIs Working Together');
  console.log('='.repeat(50));

  // Ask all AIs for a collaborative decision
  const collaborativeDecision = await tams.ai.collaborativeDecision(
    'Should I create more trading bots or focus on optimizing this one?',
    {
      appId: tradingBot.metadata.id,
      conversationHistory: [],
      capabilities: [],
    }
  );

  console.log('\n🧠 Collaborative AI Decision:\n');
  console.log('Consensus:', collaborativeDecision.consensus);
  console.log(`Confidence: ${(collaborativeDecision.confidence * 100).toFixed(0)}%`);
  console.log('\nIndividual AI Opinions:\n');

  for (const [aiId, response] of collaborativeDecision.individual.entries()) {
    console.log(`${aiId}:`);
    console.log(`  ${response.content.substring(0, 100)}...`);
    console.log();
  }

  // ========================================
  // 5. AI Communication Example
  // ========================================
  console.log('='.repeat(50));
  console.log('5. AI-to-AI Communication');
  console.log('='.repeat(50));

  console.log('\n📡 Demonstrating AI collaboration:\n');

  // Background Agent detects an issue (simulated)
  console.log('1. Background Agent detects performance issue');
  console.log('   └─> Requests Meta-Tuner for optimization\n');

  // Meta-Tuner requests analysis
  console.log('2. Meta-Tuner needs deep analysis');
  console.log('   └─> Requests Gemini for insights\n');

  // Gemini provides analysis
  const geminiAnalysis = await tams.chatWithAI(
    'gemini',
    `Analyze this trading bot for performance bottlenecks`,
    { appId: tradingBot.metadata.id }
  );

  console.log('3. Gemini provides analysis:');
  console.log(`   "${geminiAnalysis.content.substring(0, 80)}..."\n`);

  console.log('4. Meta-Tuner applies optimizations');
  console.log('   └─> Based on Gemini\'s analysis\n');

  console.log('5. Background Agent monitors results');
  console.log('   └─> Confirms improvement\n');

  console.log('✅ AI collaboration complete!\n');

  // ========================================
  // 6. Each AI in Action
  // ========================================
  console.log('='.repeat(50));
  console.log('6. Summary - Each AI\'s Role');
  console.log('='.repeat(50));

  console.log('\n🔮 Gemini AI:');
  console.log('   - Conversational and helpful');
  console.log('   - Analyzes and explains');
  console.log('   - Creates and debugs');
  console.log('   - Always available for questions\n');

  console.log('🤖 Background Agent AI:');
  console.log('   - Works autonomously 24/7');
  console.log('   - Monitors all apps constantly');
  console.log('   - Fixes issues automatically');
  console.log('   - Silent but vigilant\n');

  console.log('🎛️  Meta-Tuner AI:');
  console.log('   - Strategic optimization expert');
  console.log('   - Learns from history');
  console.log('   - Data-driven decisions');
  console.log('   - Manages app relationships\n');

  // ========================================
  // 7. Practical Workflow
  // ========================================
  console.log('='.repeat(50));
  console.log('7. Practical Workflow Example');
  console.log('='.repeat(50));

  console.log('\n📝 Complete Workflow:\n');

  console.log('Step 1: Ask Gemini for help');
  const step1 = await tams.chatWithAI('gemini', 'I want to build a web scraper for research papers');
  console.log(`✓ Gemini: "${step1.content.substring(0, 60)}..."\n`);

  console.log('Step 2: Create the app');
  const scraper = await tams.createApp('tool', 'Research Paper Scraper');
  console.log(`✓ Created: ${scraper.metadata.id}\n`);

  console.log('Step 3: Background Agent starts monitoring');
  console.log(`✓ Agent is now watching ${scraper.metadata.name}\n`);

  console.log('Step 4: Meta-Tuner optimizes');
  const scraperTuning = await tams.chatWithAI('meta-tuner', 'Optimize for research papers', {
    appId: scraper.metadata.id,
  });
  console.log(`✓ Tuner: "${scraperTuning.content.substring(0, 60)}..."\n`);

  console.log('Step 5: All AIs collaborate for final decision');
  const finalDecision = await tams.ai.collaborativeDecision(
    'Is this scraper ready for production use?',
    { appId: scraper.metadata.id, conversationHistory: [], capabilities: [] }
  );
  console.log(`✓ Consensus: ${finalDecision.consensus.substring(0, 60)}...\n`);

  console.log('🎉 Workflow complete! All AIs worked together seamlessly.\n');

  // ========================================
  // 8. System Status
  // ========================================
  console.log('='.repeat(50));
  console.log('8. Final System Status');
  console.log('='.repeat(50));

  const finalStatus = tams.getStatus();

  console.log('\n📊 System Summary:');
  console.log(`   Apps created: ${finalStatus.apps.total}`);
  console.log(`   AI Assistants: ${finalStatus.ai.count}`);
  console.log(`   AIs active: ${finalStatus.ai.names.join(', ')}`);
  console.log(`   Background tasks: ${finalStatus.agent.tasks}`);
  console.log(`   Agent running: ${finalStatus.agent.running ? 'Yes' : 'No'}\n`);

  console.log('✨ Multi-AI system demonstration complete!\n');
  console.log('Key Takeaways:');
  console.log('  1. Three specialized AIs, each with unique strengths');
  console.log('  2. AIs communicate and collaborate automatically');
  console.log('  3. Gemini for help, Agent for automation, Tuner for optimization');
  console.log('  4. Collective intelligence through collaboration');
  console.log('  5. Always available, always improving\n');

  console.log('Try it yourself in the CLI:');
  console.log('  gemini "your question"');
  console.log('  agent status');
  console.log('  tuner "optimize app_123"');
  console.log('  ask "collaborative question"\n');

  // Cleanup
  await tams.shutdown();
}

// Run the example
if (require.main === module) {
  multiAIExample().catch(console.error);
}

export default multiAIExample;
