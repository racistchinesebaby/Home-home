# Sierra Chart Mobile

A professional mobile trading platform inspired by Sierra Chart, built with React and TypeScript. Features real-time charting, technical analysis, and multi-asset trading capabilities.

## Features

### Real-Time Charting
- **Multiple Chart Types**: Candlestick, Line, and Area charts
- **Technical Indicators**:
  - Simple Moving Average (SMA 20, SMA 50)
  - Exponential Moving Average (EMA 12)
  - Bollinger Bands
  - RSI (Relative Strength Index)
  - MACD (Moving Average Convergence Divergence)
- **Timeframes**: 1m, 5m, 15m, 1h, 4h, 1d, 1w
- **Chart Statistics**: Open, High, Low, Volume

### Multi-Asset Support
- **Stocks**: Real-time stock trading (NASDAQ, NYSE)
- **Cryptocurrencies**: Bitcoin, Ethereum, Solana, and more
- **Futures**: E-mini S&P 500, E-mini NASDAQ, Crude Oil, Gold
- **Forex**: Major currency pairs (EUR/USD, GBP/USD, USD/JPY, etc.)

### Trading Interface
- **Order Types**: Market, Limit, Stop, Stop-Limit
- **Time in Force**: Day, GTC, IOC, FOK
- **Real-time Order Management**: Track pending, filled, and cancelled orders
- **Account Summary**: Buying power, cash balance, portfolio value

### Portfolio Management
- **Position Tracking**: Real-time P&L for all positions
- **Performance Metrics**: Daily, weekly, monthly, and yearly performance
- **Multi-Asset Portfolio**: Stocks, crypto, and futures in one portfolio

### Market Data
- **Exchange Status**: Real-time status for NYSE, NASDAQ, CME, Binance, Coinbase, Kraken
- **Market Categories**: Filter by Stocks, Crypto, Futures, Forex
- **Market Indices**: S&P 500, Dow Jones, NASDAQ, Russell 2000
- **Real-time Price Updates**: Live price feeds with change indicators

### Mobile-First Design
- **Touch Optimized**: Smooth touch interactions and gestures
- **Bottom Navigation**: Easy access to all major features
- **Responsive Layout**: Works on all screen sizes
- **Dark Theme**: Professional dark interface for extended use

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Charting**: TradingView Lightweight Charts
- **Styling**: Custom CSS with mobile-first approach
- **UI Components**: React Hot Toast for notifications
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/racistchinesebaby/Home-home.git
cd Home-home
```

2. Install dependencies:
```bash
npm install
```

3. Install client dependencies:
```bash
cd client
npm install
cd ..
```

### Running the Application

1. Start the client development server:
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`.

## Application Structure

```
client/src/
├── App.tsx                 # Main application component
├── App.css                 # Global styles
├── components/
│   ├── Chart.tsx          # Real-time charting component
│   ├── Trading.tsx        # Order placement interface
│   ├── Watchlist.tsx      # Symbol watchlist
│   ├── Portfolio.tsx      # Portfolio management
│   └── Markets.tsx        # Market overview
└── index.tsx              # Application entry point
```

## Features in Detail

### Charting System
The charting system uses TradingView's Lightweight Charts library to provide professional-grade candlestick charts with:
- Real-time price updates
- Multiple timeframe support
- Technical indicator overlays
- Interactive chart controls
- Touch-optimized interactions

### Trading Interface
Full-featured order placement with:
- Buy/Sell order sides
- Multiple order types (Market, Limit, Stop, Stop-Limit)
- Quantity and price inputs
- Order summary calculations
- Order history tracking
- Order cancellation

### Exchange Integration
The platform is designed to connect to multiple exchanges:
- **Stock Exchanges**: NYSE, NASDAQ
- **Futures Exchanges**: CME, NYMEX, COMEX
- **Crypto Exchanges**: Binance, Coinbase, Kraken
- Real-time exchange status monitoring
- 24/7 crypto trading support

### Algorithm Management
The platform is built to support algorithmic trading with:
- Multi-asset algorithm execution
- Simultaneous crypto and futures trading
- Real-time market data feeds
- Order management for automated strategies

## Future Enhancements

### Planned Features
- **WebSocket Integration**: Real-time market data streaming
- **Advanced Order Types**: OCO, Bracket orders, trailing stops
- **Market Depth**: Order book and DOM (Depth of Market)
- **Price Alerts**: Customizable price notifications
- **Backtesting**: Test trading strategies on historical data
- **Risk Management**: Position sizing, stop-loss automation
- **Multi-Account**: Support for multiple trading accounts
- **Algorithm Builder**: Visual algorithm creation interface
- **Paper Trading**: Practice trading with simulated money

### Prop Firm Features
The platform is being developed with prop firm capabilities in mind:
- **Trader Management**: Multi-trader account support
- **Performance Analytics**: Detailed trader statistics
- **Risk Controls**: Per-trader risk limits and rules
- **Profit Sharing**: Automated profit split calculations
- **Compliance Tools**: Trade monitoring and reporting

## Development

### Building for Production

```bash
cd client
npm run build
```

The build will create an optimized production bundle in the `build/` directory.

### Testing

```bash
cd client
npm test
```

## API Integration

The app is designed to work with real-time market data APIs:
- Stock data: Alpha Vantage, IEX Cloud, or Polygon.io
- Crypto data: Binance WebSocket API, Coinbase Pro API
- Futures data: CME DataMine or Interactive Brokers API

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by Sierra Chart's professional trading platform
- Built with TradingView's Lightweight Charts library
- Designed for mobile-first trading experience

## Support

For issues, questions, or contributions, please open an issue on GitHub.

## Disclaimer

This is a demo trading platform for educational purposes. Always conduct proper research and risk management before real trading. The creators are not responsible for any financial losses incurred through the use of this platform.
