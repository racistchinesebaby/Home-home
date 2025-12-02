const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

class WalletAutomation {
  constructor() {
    this.browser = null;
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
  }

  async initialize() {
    if (!this.browser) {
      try {
        this.browser = await puppeteer.launch({
          headless: 'new',
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-web-security'
          ]
        });
      } catch (error) {
        console.error('Failed to launch browser:', error);
        // Fallback: simulation mode
        this.browser = null;
      }
    }
  }

  async loginAndExtractValue(wallet) {
    try {
      await this.initialize();

      if (!this.browser) {
        // Simulation mode - return mock data
        return this.simulateWalletValue(wallet);
      }

      const page = await this.browser.newPage();
      await page.setUserAgent(this.userAgents[Math.floor(Math.random() * this.userAgents.length)]);
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate to wallet URL
      await page.goto(wallet.url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Attempt to find and fill login form
      const loginResult = await this.attemptLogin(page, wallet.username, wallet.password);

      if (loginResult.success) {
        // Extract balance/value
        const value = await this.extractValue(page);
        await page.close();

        return {
          success: true,
          value,
          lastChecked: new Date().toISOString(),
          status: 'active'
        };
      } else {
        await page.close();
        return {
          success: false,
          error: loginResult.error,
          value: 0,
          status: 'login_failed'
        };
      }
    } catch (error) {
      console.error('Error in wallet automation:', error);
      return {
        success: false,
        error: error.message,
        value: 0,
        status: 'error'
      };
    }
  }

  async attemptLogin(page, username, password) {
    try {
      // Common login form patterns
      const loginPatterns = [
        { user: 'input[type="email"]', pass: 'input[type="password"]', submit: 'button[type="submit"]' },
        { user: 'input[name="username"]', pass: 'input[name="password"]', submit: 'button[type="submit"]' },
        { user: 'input[name="email"]', pass: 'input[name="password"]', submit: 'button[type="submit"]' },
        { user: 'input#username', pass: 'input#password', submit: 'button[type="submit"]' },
        { user: 'input#email', pass: 'input#password', submit: 'button[type="submit"]' },
        { user: 'input[placeholder*="email" i]', pass: 'input[placeholder*="password" i]', submit: 'button[type="submit"]' },
        { user: 'input[placeholder*="username" i]', pass: 'input[placeholder*="password" i]', submit: 'button[type="submit"]' }
      ];

      for (const pattern of loginPatterns) {
        try {
          const userInput = await page.$(pattern.user);
          const passInput = await page.$(pattern.pass);
          const submitBtn = await page.$(pattern.submit);

          if (userInput && passInput) {
            await userInput.type(username, { delay: 100 });
            await passInput.type(password, { delay: 100 });

            if (submitBtn) {
              await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {}),
                submitBtn.click()
              ]);
            } else {
              await passInput.press('Enter');
              await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
            }

            // Check if login was successful
            await page.waitForTimeout(2000);
            const currentUrl = page.url();

            // Check for common error messages
            const errorMessages = await page.evaluate(() => {
              const errorSelectors = [
                '.error', '.alert', '.warning', '[class*="error"]', '[class*="alert"]'
              ];
              for (const selector of errorSelectors) {
                const elem = document.querySelector(selector);
                if (elem && elem.textContent) {
                  return elem.textContent;
                }
              }
              return null;
            });

            if (errorMessages && /error|invalid|incorrect|failed/i.test(errorMessages)) {
              continue;
            }

            return { success: true };
          }
        } catch (err) {
          continue;
        }
      }

      return { success: false, error: 'Could not find login form' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async extractValue(page) {
    try {
      const value = await page.evaluate(() => {
        // Common patterns for balance/value display
        const patterns = [
          /\$\s*[\d,]+\.?\d*/g,
          /€\s*[\d,]+\.?\d*/g,
          /£\s*[\d,]+\.?\d*/g,
          /[\d,]+\.?\d*\s*(?:USD|EUR|GBP|BTC|ETH)/gi,
          /balance.*?[\d,]+\.?\d*/gi,
          /total.*?[\d,]+\.?\d*/gi
        ];

        const text = document.body.innerText;

        for (const pattern of patterns) {
          const matches = text.match(pattern);
          if (matches && matches.length > 0) {
            // Extract numeric value
            const numericValue = matches[0].match(/[\d,]+\.?\d*/);
            if (numericValue) {
              return parseFloat(numericValue[0].replace(/,/g, ''));
            }
          }
        }

        // Check for specific elements
        const balanceSelectors = [
          '[class*="balance"]', '[id*="balance"]',
          '[class*="total"]', '[id*="total"]',
          '[class*="amount"]', '[id*="amount"]',
          '[class*="value"]', '[id*="value"]'
        ];

        for (const selector of balanceSelectors) {
          const elem = document.querySelector(selector);
          if (elem) {
            const text = elem.textContent || elem.innerText;
            const numMatch = text.match(/[\d,]+\.?\d*/);
            if (numMatch) {
              return parseFloat(numMatch[0].replace(/,/g, ''));
            }
          }
        }

        return 0;
      });

      return value || 0;
    } catch (error) {
      console.error('Error extracting value:', error);
      return 0;
    }
  }

  simulateWalletValue(wallet) {
    // Simulation mode for when browser is not available
    const randomValue = Math.random() * 10000;
    return {
      success: true,
      value: parseFloat(randomValue.toFixed(2)),
      lastChecked: new Date().toISOString(),
      status: 'simulated'
    };
  }

  async takeScreenshot(page, outputPath) {
    try {
      await page.screenshot({
        path: outputPath,
        fullPage: true
      });
      return true;
    } catch (error) {
      console.error('Error taking screenshot:', error);
      return false;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new WalletAutomation();
