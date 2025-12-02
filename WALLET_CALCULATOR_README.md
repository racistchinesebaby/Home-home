# Web Wallet Value Calculator

A comprehensive solution for tracking and managing web wallet values with automated discovery, document parsing, screenshot processing, and value calculations.

## Features

### Document Reading & Parsing
- Upload text documents (.txt, .doc, .docx, .pdf) containing wallet information
- Automatically extracts wallet URLs, usernames, and passwords
- Supports multiple document formats:
  - Labeled format (URL:, Username:, Password:)
  - Simple line format (URL username password)
  - Structured format with variations
  - Compact multi-line format

### Screenshot Processing
- Upload screenshots of wallet pages
- Image processing and analysis
- Support for PNG, JPG, JPEG, WebP formats
- Optimized for balance/value extraction

### Automated Login & Value Extraction
- Attempts to log into wallet sites using provided credentials
- Automatically extracts balance/value from authenticated pages
- Supports common wallet and exchange platforms
- Handles multiple authentication patterns
- Simulation mode when browser automation is unavailable

### Value Management
- Track unlimited web wallets
- Real-time value updates
- Manual value entry and editing
- Add/Subtract operations across multiple wallets
- Individual wallet value fetching
- Batch value fetching for all wallets

### Visual Interface
- Clean, modern dark theme interface
- Real-time wallet counter
- Total value aggregation
- Status indicators (active, pending, error, etc.)
- Clickable wallet links
- Checkbox selection for bulk operations
- Responsive design for all devices

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

The wallet calculator is integrated into the main application. To run:

1. Start the server:
```bash
cd server
npm run dev
```

2. Start the client (in a new terminal):
```bash
cd client
npm start
```

3. Navigate to: http://localhost:3000/wallet-calculator

## Usage Guide

### 1. Upload a Document

Create a text file with your wallet information:

```
URL: https://wallet.example.com
Username: user@example.com
Password: password123

URL: https://another-wallet.com
Username: username2
Password: pass456
```

Click "Upload Document" and select your file. The system will automatically parse and add all wallets.

### 2. Add Wallets Manually

Click "Add Manual Wallet" and fill in:
- Wallet URL
- Username
- Password
- Initial Value (optional)

### 3. Process Screenshots

Take a screenshot of your wallet dashboard and upload it using "Upload Screenshot". The system will process the image and extract available information.

### 4. Fetch Wallet Values

**Individual Wallet:**
- Click the 🔄 button next to any wallet to attempt automatic login and value extraction

**All Wallets:**
- Click "Fetch All Values" to update all wallets at once

**Manual Update:**
- Edit the value input field directly for any wallet

### 5. Perform Calculations

1. Select wallets using checkboxes
2. Enter an amount in the calculation field
3. Click "Add" or "Subtract" to adjust values
4. The total value updates automatically

### 6. Manage Wallets

- **View Details:** Click on wallet URLs to open them in a new tab
- **Edit Values:** Modify the value input field and press Enter
- **Delete Wallets:** Click the 🗑️ button to remove a wallet
- **Check Status:** Green = Active, Yellow = Pending, Red = Error

## Document Format Examples

### Format 1: Labeled
```
URL: https://wallet1.com
Username: user1
Password: pass1
```

### Format 2: Simple
```
https://wallet2.com user2 pass2
```

### Format 3: Structured
```
Website: https://wallet3.com
User: user3
Pass: pass3
```

### Format 4: Compact
```
https://wallet4.com
user4
pass4
```

## API Endpoints

### Wallet Management
- `POST /api/wallet/parse-document` - Parse and extract wallet info from document
- `POST /api/wallet/process-screenshot` - Process screenshot image
- `GET /api/wallet/wallets` - Get all wallets with summary
- `POST /api/wallet/wallets` - Add wallet manually
- `PUT /api/wallet/wallets/:id` - Update wallet value
- `DELETE /api/wallet/wallets/:id` - Delete wallet
- `POST /api/wallet/wallets/:id/fetch-value` - Fetch single wallet value
- `POST /api/wallet/wallets/fetch-all` - Fetch all wallet values
- `POST /api/wallet/calculate` - Perform add/subtract operations
- `DELETE /api/wallet/wallets` - Clear all wallets

## Security Considerations

**Important:** This tool is designed for authorized use only.

- Store credentials securely
- Use test credentials for testing
- Be aware of rate limiting on wallet sites
- Respect site terms of service
- Use HTTPS for all wallet URLs
- Keep the application secure and up-to-date

## Features in Detail

### Automated Discovery
The system can:
- Parse multiple wallet entries from a single document
- Detect various URL patterns
- Extract usernames and passwords in different formats
- Handle emails as usernames
- Support various authentication schemes

### Value Tracking
- Supports multiple currencies (USD, EUR, GBP, BTC, ETH, etc.)
- Automatic currency detection
- Numeric value extraction from complex layouts
- Manual override for accuracy
- Real-time total calculation

### Relational Display
- Each wallet appears as both:
  - A standalone link (clickable URL)
  - A valued entity (shows current value)
- Wallets can be selected for bulk operations
- Status indicators show operational state
- Last checked timestamps for value freshness

## Troubleshooting

### Document Not Parsing
- Check file format (should be .txt, .doc, .docx, or .pdf)
- Verify wallet information follows one of the supported formats
- Ensure URLs are complete (include https://)

### Login Failed
- Verify credentials are correct
- Check if the site has CAPTCHA or 2FA
- Some sites may block automated logins
- Use manual value entry as fallback

### Value Not Extracted
- Different sites have different layouts
- The system looks for common patterns
- Use manual value entry for accuracy
- Check browser console for errors

### Screenshot Processing
- Ensure image is clear and high quality
- Supported formats: PNG, JPG, JPEG, WebP
- Maximum file size: 10MB
- OCR works best with clear text

## Example Use Cases

1. **Cryptocurrency Portfolio Tracking**
   - Add all your crypto exchange accounts
   - Fetch values to see total portfolio value
   - Track changes over time

2. **Multi-Bank Account Management**
   - List all your online banking accounts
   - Manual value entry for balances
   - Calculate total liquid assets

3. **Digital Wallet Aggregation**
   - PayPal, Venmo, Cash App, etc.
   - See all balances in one place
   - Perform what-if calculations

4. **Investment Portfolio**
   - Brokerage accounts
   - Retirement accounts
   - Track total investment value

## Technology Stack

### Backend
- Node.js + Express
- Puppeteer (browser automation)
- Cheerio (HTML parsing)
- Sharp (image processing)
- Multer (file uploads)

### Frontend
- React + TypeScript
- Tailwind CSS
- Axios (API calls)
- React Router (navigation)
- React Hot Toast (notifications)

## Contributing

To extend the wallet calculator:

1. **Add New Parsers:** Modify `server/services/documentParser.js`
2. **Add Login Patterns:** Extend `server/services/walletAutomation.js`
3. **Add Value Extractors:** Update extraction logic in automation service
4. **Enhance UI:** Modify `client/src/components/WalletCalculator.tsx`

## License

This project is licensed under the MIT License.

## Support

For issues or questions:
- Check the example document: `example-wallets.txt`
- Review this README
- Check browser console for errors
- Verify server logs for backend issues

---

**Note:** Always use this tool responsibly and only with accounts you own or have permission to access.
