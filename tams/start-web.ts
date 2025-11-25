#!/usr/bin/env ts-node

/**
 * Start TAMS with Web Interface
 * Access from mobile browser at http://your-ip:3001
 */

import { TAMS } from './core/index';
import { BrowserIntegration } from './core/browser';

async function startTAMSWeb() {
  const tams = new TAMS();

  // Wait for TAMS to initialize
  await new Promise(resolve => {
    tams.once('system:ready', resolve);
  });

  // Start browser interface
  const browser = new BrowserIntegration(tams, {
    port: 3001,
    host: '0.0.0.0', // Listen on all network interfaces
    enableCORS: true,
  });

  await browser.start();

  console.log('\n🌐 TAMS Web Interface Running!');
  console.log('━'.repeat(50));
  console.log('\n📱 Access from your phone:');
  console.log(`   http://localhost:3001`);
  console.log(`   http://your-computer-ip:3001`);
  console.log('\n💻 Access from this computer:');
  console.log(`   http://localhost:3001`);
  console.log('\n━'.repeat(50));
  console.log('\nPress Ctrl+C to stop\n');
}

startTAMSWeb().catch(console.error);
