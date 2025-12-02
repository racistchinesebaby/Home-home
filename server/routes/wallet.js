const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const documentParser = require('../services/documentParser');
const walletAutomation = require('../services/walletAutomation');
const screenshotProcessor = require('../services/screenshotProcessor');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = file.fieldname === 'screenshot'
      ? 'uploads/screenshots'
      : 'uploads/documents';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedDocTypes = /txt|doc|docx|pdf/;
    const allowedImageTypes = /png|jpg|jpeg|webp/;

    const extname = path.extname(file.originalname).toLowerCase();

    if (file.fieldname === 'document' && allowedDocTypes.test(extname)) {
      cb(null, true);
    } else if (file.fieldname === 'screenshot' && allowedImageTypes.test(extname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// In-memory wallet storage (in production, use a database)
let wallets = [];
let walletCounter = 0;

// Parse document and extract wallet information
router.post('/parse-document', upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No document file provided' });
    }

    const parsedWallets = await documentParser.parseDocument(req.file.path);

    // Add to wallet list
    parsedWallets.forEach(wallet => {
      walletCounter++;
      wallet.id = walletCounter;
      wallets.push(wallet);
    });

    res.json({
      success: true,
      count: parsedWallets.length,
      wallets: parsedWallets
    });
  } catch (error) {
    console.error('Error parsing document:', error);
    res.status(500).json({ error: 'Failed to parse document', details: error.message });
  }
});

// Process screenshot
router.post('/process-screenshot', upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No screenshot file provided' });
    }

    const result = await screenshotProcessor.processScreenshot(req.file.path);

    res.json({
      success: true,
      screenshot: result
    });
  } catch (error) {
    console.error('Error processing screenshot:', error);
    res.status(500).json({ error: 'Failed to process screenshot', details: error.message });
  }
});

// Get all wallets
router.get('/wallets', (req, res) => {
  try {
    const totalValue = wallets.reduce((sum, wallet) => sum + (wallet.value || 0), 0);

    res.json({
      success: true,
      wallets,
      summary: {
        total: wallets.length,
        totalValue: totalValue.toFixed(2),
        active: wallets.filter(w => w.status === 'active').length,
        pending: wallets.filter(w => w.status === 'pending').length
      }
    });
  } catch (error) {
    console.error('Error fetching wallets:', error);
    res.status(500).json({ error: 'Failed to fetch wallets' });
  }
});

// Add wallet manually
router.post('/wallets', (req, res) => {
  try {
    const { url, username, password, value } = req.body;

    if (!url || !username || !password) {
      return res.status(400).json({ error: 'URL, username, and password are required' });
    }

    walletCounter++;
    const wallet = {
      id: walletCounter,
      url,
      username,
      password,
      domain: new URL(url).hostname.replace(/^www\./, ''),
      value: parseFloat(value) || 0,
      lastChecked: new Date().toISOString(),
      status: 'manual'
    };

    wallets.push(wallet);

    res.json({
      success: true,
      wallet
    });
  } catch (error) {
    console.error('Error adding wallet:', error);
    res.status(500).json({ error: 'Failed to add wallet', details: error.message });
  }
});

// Update wallet value
router.put('/wallets/:id', (req, res) => {
  try {
    const walletId = parseInt(req.params.id);
    const { value, status } = req.body;

    const wallet = wallets.find(w => w.id === walletId);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (value !== undefined) {
      wallet.value = parseFloat(value);
    }

    if (status) {
      wallet.status = status;
    }

    wallet.lastChecked = new Date().toISOString();

    res.json({
      success: true,
      wallet
    });
  } catch (error) {
    console.error('Error updating wallet:', error);
    res.status(500).json({ error: 'Failed to update wallet' });
  }
});

// Delete wallet
router.delete('/wallets/:id', (req, res) => {
  try {
    const walletId = parseInt(req.params.id);
    const initialLength = wallets.length;

    wallets = wallets.filter(w => w.id !== walletId);

    if (wallets.length === initialLength) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({
      success: true,
      message: 'Wallet deleted'
    });
  } catch (error) {
    console.error('Error deleting wallet:', error);
    res.status(500).json({ error: 'Failed to delete wallet' });
  }
});

// Login to wallet and fetch value
router.post('/wallets/:id/fetch-value', async (req, res) => {
  try {
    const walletId = parseInt(req.params.id);
    const wallet = wallets.find(w => w.id === walletId);

    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    const result = await walletAutomation.loginAndExtractValue(wallet);

    // Update wallet with new information
    wallet.value = result.value;
    wallet.lastChecked = result.lastChecked;
    wallet.status = result.status;

    if (!result.success) {
      wallet.error = result.error;
    }

    res.json({
      success: result.success,
      wallet,
      result
    });
  } catch (error) {
    console.error('Error fetching wallet value:', error);
    res.status(500).json({ error: 'Failed to fetch wallet value', details: error.message });
  }
});

// Fetch all wallet values
router.post('/wallets/fetch-all', async (req, res) => {
  try {
    const results = [];

    for (const wallet of wallets) {
      if (wallet.status === 'pending' || wallet.status === 'active') {
        const result = await walletAutomation.loginAndExtractValue(wallet);
        wallet.value = result.value;
        wallet.lastChecked = result.lastChecked;
        wallet.status = result.status;
        results.push({ walletId: wallet.id, ...result });
      }
    }

    res.json({
      success: true,
      results,
      totalValue: wallets.reduce((sum, w) => sum + (w.value || 0), 0)
    });
  } catch (error) {
    console.error('Error fetching all wallet values:', error);
    res.status(500).json({ error: 'Failed to fetch wallet values' });
  }
});

// Clear all wallets
router.delete('/wallets', (req, res) => {
  try {
    wallets = [];
    walletCounter = 0;

    res.json({
      success: true,
      message: 'All wallets cleared'
    });
  } catch (error) {
    console.error('Error clearing wallets:', error);
    res.status(500).json({ error: 'Failed to clear wallets' });
  }
});

// Calculate operations (add/subtract)
router.post('/calculate', (req, res) => {
  try {
    const { walletIds, operation, amount } = req.body;

    if (!walletIds || !Array.isArray(walletIds) || !operation || amount === undefined) {
      return res.status(400).json({ error: 'Invalid request parameters' });
    }

    const adjustAmount = parseFloat(amount);
    const updatedWallets = [];

    walletIds.forEach(id => {
      const wallet = wallets.find(w => w.id === id);
      if (wallet) {
        if (operation === 'add') {
          wallet.value += adjustAmount;
        } else if (operation === 'subtract') {
          wallet.value -= adjustAmount;
        }
        wallet.lastChecked = new Date().toISOString();
        updatedWallets.push(wallet);
      }
    });

    const totalValue = wallets.reduce((sum, w) => sum + (w.value || 0), 0);

    res.json({
      success: true,
      updatedWallets,
      totalValue: totalValue.toFixed(2)
    });
  } catch (error) {
    console.error('Error performing calculation:', error);
    res.status(500).json({ error: 'Failed to perform calculation' });
  }
});

module.exports = router;
