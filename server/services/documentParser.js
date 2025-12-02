const fs = require('fs').promises;

class DocumentParser {
  constructor() {
    this.urlRegex = /https?:\/\/[^\s]+/g;
    this.credentialPatterns = [
      // Pattern: URL followed by username and password
      /(?:URL|Link|Website):\s*(https?:\/\/[^\s]+)\s*(?:Username|User|Email):\s*([^\s]+)\s*(?:Password|Pass|Pwd):\s*([^\s]+)/gi,
      // Pattern: More flexible format
      /(https?:\/\/[^\s]+)\s+([^\s]+@[^\s]+|username:\s*[^\s]+|user:\s*[^\s]+)\s+([^\s]+|password:\s*[^\s]+|pass:\s*[^\s]+)/gi,
      // Pattern: Simple line format
      /^(https?:\/\/[^\s]+)\s+([^\s]+)\s+([^\s]+)$/gm
    ];
  }

  async parseDocument(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return this.extractWalletInfo(content);
    } catch (error) {
      console.error('Error parsing document:', error);
      throw new Error('Failed to parse document');
    }
  }

  extractWalletInfo(content) {
    const wallets = [];
    const lines = content.split('\n');

    // Try structured parsing first
    for (const pattern of this.credentialPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const wallet = this.createWalletEntry(match[1], match[2], match[3]);
        if (wallet) wallets.push(wallet);
      }
    }

    // Fallback: Line-by-line parsing
    if (wallets.length === 0) {
      wallets.push(...this.parseLineByLine(lines));
    }

    // Remove duplicates
    return this.deduplicateWallets(wallets);
  }

  parseLineByLine(lines) {
    const wallets = [];
    let currentWallet = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) {
        if (currentWallet.url) {
          wallets.push(this.normalizeWallet(currentWallet));
          currentWallet = {};
        }
        continue;
      }

      // Check for URL
      const urlMatch = line.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        if (currentWallet.url) {
          wallets.push(this.normalizeWallet(currentWallet));
        }
        currentWallet = { url: urlMatch[0] };
        continue;
      }

      // Check for username
      if (/username|user|email/i.test(line) && currentWallet.url && !currentWallet.username) {
        const usernameMatch = line.match(/[:=]\s*(.+)$/);
        if (usernameMatch) {
          currentWallet.username = usernameMatch[1].trim();
        } else {
          // Try next line
          if (i + 1 < lines.length) {
            currentWallet.username = lines[i + 1].trim();
            i++;
          }
        }
        continue;
      }

      // Check for password
      if (/password|pass|pwd/i.test(line) && currentWallet.url && !currentWallet.password) {
        const passwordMatch = line.match(/[:=]\s*(.+)$/);
        if (passwordMatch) {
          currentWallet.password = passwordMatch[1].trim();
        } else {
          // Try next line
          if (i + 1 < lines.length) {
            currentWallet.password = lines[i + 1].trim();
            i++;
          }
        }
        continue;
      }

      // If we have a URL but no explicit labels, assume format: URL username password
      if (currentWallet.url && !currentWallet.username && !line.includes('http')) {
        currentWallet.username = line;
      } else if (currentWallet.url && currentWallet.username && !currentWallet.password && !line.includes('http')) {
        currentWallet.password = line;
      }
    }

    // Don't forget the last wallet
    if (currentWallet.url) {
      wallets.push(this.normalizeWallet(currentWallet));
    }

    return wallets;
  }

  createWalletEntry(url, username, password) {
    // Clean up extracted values
    url = url.trim();
    username = username.replace(/^(username|user|email):\s*/i, '').trim();
    password = password.replace(/^(password|pass|pwd):\s*/i, '').trim();

    if (!url || !username || !password) {
      return null;
    }

    return this.normalizeWallet({ url, username, password });
  }

  normalizeWallet(wallet) {
    if (!wallet.url || !wallet.username || !wallet.password) {
      return null;
    }

    // Extract domain name for display
    try {
      const urlObj = new URL(wallet.url);
      const domain = urlObj.hostname.replace(/^www\./, '');

      return {
        id: this.generateId(),
        url: wallet.url,
        username: wallet.username,
        password: wallet.password,
        domain,
        value: 0,
        lastChecked: null,
        status: 'pending'
      };
    } catch (error) {
      console.error('Invalid URL:', wallet.url);
      return null;
    }
  }

  deduplicateWallets(wallets) {
    const seen = new Set();
    return wallets.filter(wallet => {
      if (!wallet) return false;
      const key = `${wallet.url}-${wallet.username}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  generateId() {
    return `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Parse screenshot text content
  parseScreenshotText(text) {
    return this.extractWalletInfo(text);
  }
}

module.exports = new DocumentParser();
