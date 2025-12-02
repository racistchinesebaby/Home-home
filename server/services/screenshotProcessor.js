const sharp = require('sharp');
const fs = require('fs').promises;
const documentParser = require('./documentParser');

class ScreenshotProcessor {
  constructor() {
    this.supportedFormats = ['png', 'jpg', 'jpeg', 'webp'];
  }

  async processScreenshot(filePath) {
    try {
      // Validate image
      const metadata = await sharp(filePath).metadata();

      if (!this.supportedFormats.includes(metadata.format)) {
        throw new Error(`Unsupported image format: ${metadata.format}`);
      }

      // For now, return the processed image path
      // In a full implementation, this would use OCR
      return {
        success: true,
        imagePath: filePath,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format
        },
        extracted: {
          text: null,
          wallets: []
        }
      };
    } catch (error) {
      console.error('Error processing screenshot:', error);
      throw new Error('Failed to process screenshot');
    }
  }

  async extractTextFromImage(filePath) {
    // Placeholder for OCR functionality
    // In production, this would use Tesseract.js or similar
    try {
      // Enhance image for better OCR results
      const enhancedPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '_enhanced.$1');

      await sharp(filePath)
        .grayscale()
        .normalize()
        .sharpen()
        .toFile(enhancedPath);

      // Return placeholder result
      return {
        success: true,
        text: '',
        confidence: 0,
        note: 'OCR not implemented - manual entry required'
      };
    } catch (error) {
      console.error('Error extracting text:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async analyzeWalletScreenshot(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();

      // Use image processing to detect potential balance/value regions
      const analysis = await this.detectBalanceRegions(filePath);

      return {
        success: true,
        metadata,
        analysis,
        imagePath: filePath
      };
    } catch (error) {
      console.error('Error analyzing screenshot:', error);
      throw new Error('Failed to analyze screenshot');
    }
  }

  async detectBalanceRegions(filePath) {
    // Simplified balance detection
    // In production, this would use computer vision/OCR
    return {
      detected: false,
      regions: [],
      suggestion: 'Please enter the wallet value manually or provide a document with wallet information'
    };
  }

  async resizeImage(filePath, maxWidth = 1920, maxHeight = 1080) {
    try {
      const outputPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '_resized.$1');

      await sharp(filePath)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.error('Error resizing image:', error);
      throw new Error('Failed to resize image');
    }
  }

  validateImageFile(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return this.supportedFormats.includes(ext);
  }
}

module.exports = new ScreenshotProcessor();
