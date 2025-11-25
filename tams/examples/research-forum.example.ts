/**
 * Example: Creating a research forum with bounties
 */

import { TAMS } from '../core/index';

async function researchForumExample() {
  const tams = new TAMS();

  // Wait for system to initialize
  await new Promise(resolve => {
    tams.once('system:ready', resolve);
  });

  console.log('Creating research forum...');

  // Install research forum from store
  const forum = await tams.installApp('research-forum', {
    bounties: {
      enabled: true,
      minBounty: 50,
      currency: 'USD',
    },
    collaboration: {
      maxConcurrentUsers: 100,
      autoSaveInterval: 15000,
      versionControl: true,
    },
  });

  console.log(`Created forum: ${forum.metadata.id}`);

  // Create research topics
  console.log('\nCreating research topics...');

  const topic1 = await tams.executeApp(forum.metadata.id, 'createTopic', [
    {
      title: 'Novel Attention Mechanisms for Transformers',
      description:
        'Research on improving attention efficiency in large language models. Looking for novel approaches that reduce computational complexity while maintaining performance.',
      author: 'researcher1',
      tags: ['transformers', 'attention', 'efficiency', 'llm'],
      bounty: 500,
    },
  ]);

  console.log(`Created topic: ${topic1.title} with $${topic1.bounty} bounty`);

  const topic2 = await tams.executeApp(forum.metadata.id, 'createTopic', [
    {
      title: 'Quantum Computing Applications in Cryptography',
      description:
        'Exploring post-quantum cryptography algorithms and their practical implementations.',
      author: 'researcher2',
      tags: ['quantum', 'cryptography', 'security'],
      bounty: 1000,
    },
  ]);

  console.log(`Created topic: ${topic2.title} with $${topic2.bounty} bounty`);

  // Add contributions
  console.log('\nAdding contributions...');

  const contribution1 = await tams.executeApp(forum.metadata.id, 'addContribution', [
    {
      topicId: topic1.id,
      author: 'contributor1',
      content:
        'I propose using sparse attention patterns with learned routing. This reduces complexity from O(n²) to O(n√n) while maintaining 95% of dense attention performance.',
    },
  ]);

  console.log(`Added contribution: ${contribution1.id}`);

  const contribution2 = await tams.executeApp(forum.metadata.id, 'addContribution', [
    {
      topicId: topic1.id,
      author: 'contributor2',
      content:
        'Building on the previous idea, we could use hierarchical attention with multi-scale processing. Here are my experimental results...',
    },
  ]);

  console.log(`Added contribution: ${contribution2.id}`);

  // Search forum
  console.log('\nSearching forum...');
  const searchResults = await tams.executeApp(forum.metadata.id, 'search', ['attention']);

  console.log(`Found ${searchResults.topics.length} topics and ${searchResults.contributions.length} contributions`);

  // List topics with bounties
  console.log('\nBounty topics:');
  const bountyTopics = await tams.executeApp(forum.metadata.id, 'listTopics', [
    { bountyOnly: true },
  ]);

  for (const topic of bountyTopics) {
    console.log(`  - ${topic.title}: $${topic.bounty} (${topic.status})`);
  }

  // Resolve a bounty
  console.log('\nResolving bounty...');
  await tams.executeApp(forum.metadata.id, 'resolveBounty', [topic1.id, contribution1.id]);

  console.log(`Bounty awarded to contributor1`);

  // Get forum statistics
  const stats = await tams.executeApp(forum.metadata.id, 'getStats');

  console.log('\nForum Statistics:', {
    totalTopics: stats.totalTopics,
    topicsByStatus: stats.topicsByStatus,
    totalContributions: stats.totalContributions,
    totalBounties: stats.totalBounties,
    totalBountyAmount: `$${stats.totalBountyAmount}`,
  });

  // Clone forum for different research area
  console.log('\nCloning forum for biology research...');
  const bioForum = await tams.cloneApp(forum.metadata.id, {
    name: 'Biology Research Forum',
  });

  console.log(`Created specialized forum: ${bioForum.metadata.id}`);

  // The background agent will:
  // - Monitor forum activity
  // - Suggest related topics
  // - Identify high-quality contributions
  // - Recommend bounty amounts
  // - Moderate content (future feature)

  console.log('\nForum is live! Background agent will monitor and optimize.');
}

// Run the example
if (require.main === module) {
  researchForumExample().catch(console.error);
}

export default researchForumExample;
