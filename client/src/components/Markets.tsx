import React, { useState } from 'react';

interface MarketsProps {
  onSymbolSelect: (symbol: any) => void;
}

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  exchange: string;
  type: 'stock' | 'crypto' | 'futures' | 'forex';
}

interface Exchange {
  name: string;
  status: 'open' | 'closed' | 'pre-market' | 'after-hours';
  nextClose?: string;
  nextOpen?: string;
}

const Markets: React.FC<MarketsProps> = ({ onSymbolSelect }) => {
  const [activeMarket, setActiveMarket] = useState<'stocks' | 'crypto' | 'futures' | 'forex'>('stocks');

  const exchanges: Exchange[] = [
    { name: 'NYSE', status: 'open', nextClose: '4:00 PM EST' },
    { name: 'NASDAQ', status: 'open', nextClose: '4:00 PM EST' },
    { name: 'CME', status: 'open', nextClose: '5:00 PM EST' },
    { name: 'Binance', status: 'open', nextClose: '24/7' },
    { name: 'Coinbase', status: 'open', nextClose: '24/7' },
    { name: 'Kraken', status: 'open', nextClose: '24/7' },
  ];

  const marketData: Record<string, MarketData[]> = {
    stocks: [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 178.45, change: 2.15, changePercent: 1.22, volume: '52.3M', exchange: 'NASDAQ', type: 'stock' },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: -1.24, changePercent: -0.33, volume: '28.5M', exchange: 'NASDAQ', type: 'stock' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.65, change: 3.42, changePercent: 2.46, volume: '35.2M', exchange: 'NASDAQ', type: 'stock' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 155.32, change: -2.18, changePercent: -1.38, volume: '45.8M', exchange: 'NASDAQ', type: 'stock' },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 242.84, change: -3.56, changePercent: -1.45, volume: '102.5M', exchange: 'NASDAQ', type: 'stock' },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 495.22, change: 12.45, changePercent: 2.58, volume: '38.9M', exchange: 'NASDAQ', type: 'stock' },
    ],
    crypto: [
      { symbol: 'BTCUSD', name: 'Bitcoin', price: 43250.50, change: 1230.25, changePercent: 2.93, volume: '28.5B', exchange: 'Binance', type: 'crypto' },
      { symbol: 'ETHUSD', name: 'Ethereum', price: 2285.75, change: -45.30, changePercent: -1.94, volume: '12.3B', exchange: 'Binance', type: 'crypto' },
      { symbol: 'BNBUSD', name: 'Binance Coin', price: 312.45, change: 8.25, changePercent: 2.71, volume: '1.2B', exchange: 'Binance', type: 'crypto' },
      { symbol: 'SOLUSD', name: 'Solana', price: 58.42, change: 3.28, changePercent: 5.95, volume: '1.2B', exchange: 'Binance', type: 'crypto' },
      { symbol: 'XRPUSD', name: 'Ripple', price: 0.6234, change: 0.0145, changePercent: 2.38, volume: '2.5B', exchange: 'Coinbase', type: 'crypto' },
      { symbol: 'ADAUSD', name: 'Cardano', price: 0.3842, change: -0.0125, changePercent: -3.15, volume: '850M', exchange: 'Kraken', type: 'crypto' },
    ],
    futures: [
      { symbol: 'ESZ23', name: 'E-mini S&P 500 Dec 23', price: 4563.25, change: 15.50, changePercent: 0.34, volume: '2.1M', exchange: 'CME', type: 'futures' },
      { symbol: 'NQZ23', name: 'E-mini NASDAQ Dec 23', price: 15842.50, change: 82.25, changePercent: 0.52, volume: '1.5M', exchange: 'CME', type: 'futures' },
      { symbol: 'CLZ23', name: 'Crude Oil Dec 23', price: 77.85, change: -0.45, changePercent: -0.57, volume: '385K', exchange: 'NYMEX', type: 'futures' },
      { symbol: 'GCZ23', name: 'Gold Dec 23', price: 2042.30, change: 12.80, changePercent: 0.63, volume: '245K', exchange: 'COMEX', type: 'futures' },
      { symbol: 'NGZ23', name: 'Natural Gas Dec 23', price: 2.845, change: 0.125, changePercent: 4.59, volume: '195K', exchange: 'NYMEX', type: 'futures' },
    ],
    forex: [
      { symbol: 'EURUSD', name: 'EUR/USD', price: 1.0945, change: 0.0023, changePercent: 0.21, volume: '145B', exchange: 'Forex', type: 'forex' },
      { symbol: 'GBPUSD', name: 'GBP/USD', price: 1.2685, change: -0.0045, changePercent: -0.35, volume: '98B', exchange: 'Forex', type: 'forex' },
      { symbol: 'USDJPY', name: 'USD/JPY', price: 149.85, change: 0.45, changePercent: 0.30, volume: '132B', exchange: 'Forex', type: 'forex' },
      { symbol: 'AUDUSD', name: 'AUD/USD', price: 0.6542, change: 0.0015, changePercent: 0.23, volume: '52B', exchange: 'Forex', type: 'forex' },
      { symbol: 'USDCAD', name: 'USD/CAD', price: 1.3625, change: -0.0028, changePercent: -0.21, volume: '45B', exchange: 'Forex', type: 'forex' },
    ],
  };

  return (
    <div className="markets-container">
      <div className="exchanges-status">
        <h3>Exchange Status</h3>
        <div className="exchanges-grid">
          {exchanges.map((exchange) => (
            <div key={exchange.name} className="exchange-card">
              <div className="exchange-name">{exchange.name}</div>
              <div className={`exchange-status ${exchange.status}`}>
                <span className="status-dot"></span>
                {exchange.status === 'open' ? 'Open' : 'Closed'}
              </div>
              {exchange.nextClose && exchange.nextClose !== '24/7' && (
                <div className="exchange-time">Closes: {exchange.nextClose}</div>
              )}
              {exchange.nextClose === '24/7' && (
                <div className="exchange-time">24/7 Trading</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="market-tabs">
        <button
          className={`market-tab ${activeMarket === 'stocks' ? 'active' : ''}`}
          onClick={() => setActiveMarket('stocks')}
        >
          Stocks
        </button>
        <button
          className={`market-tab ${activeMarket === 'crypto' ? 'active' : ''}`}
          onClick={() => setActiveMarket('crypto')}
        >
          Crypto
        </button>
        <button
          className={`market-tab ${activeMarket === 'futures' ? 'active' : ''}`}
          onClick={() => setActiveMarket('futures')}
        >
          Futures
        </button>
        <button
          className={`market-tab ${activeMarket === 'forex' ? 'active' : ''}`}
          onClick={() => setActiveMarket('forex')}
        >
          Forex
        </button>
      </div>

      <div className="market-list">
        {marketData[activeMarket].map((item) => (
          <div
            key={item.symbol}
            className="market-item"
            onClick={() => onSymbolSelect(item)}
          >
            <div className="market-item-left">
              <div className="market-symbol">{item.symbol}</div>
              <div className="market-name">{item.name}</div>
              <div className="market-exchange">{item.exchange}</div>
            </div>
            <div className="market-item-right">
              <div className="market-price">${item.price.toFixed(activeMarket === 'forex' ? 4 : 2)}</div>
              <div className={`market-change ${item.change >= 0 ? 'positive' : 'negative'}`}>
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(activeMarket === 'forex' ? 4 : 2)}
                ({item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%)
              </div>
              <div className="market-volume">Vol: {item.volume}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="market-indices">
        <h3>Market Indices</h3>
        <div className="indices-grid">
          <div className="index-card">
            <div className="index-name">S&P 500</div>
            <div className="index-value">4,563.25</div>
            <div className="index-change positive">+15.50 (+0.34%)</div>
          </div>
          <div className="index-card">
            <div className="index-name">Dow Jones</div>
            <div className="index-value">35,842.10</div>
            <div className="index-change negative">-42.35 (-0.12%)</div>
          </div>
          <div className="index-card">
            <div className="index-name">NASDAQ</div>
            <div className="index-value">15,842.50</div>
            <div className="index-change positive">+82.25 (+0.52%)</div>
          </div>
          <div className="index-card">
            <div className="index-name">Russell 2000</div>
            <div className="index-value">1,925.45</div>
            <div className="index-change positive">+8.15 (+0.43%)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Markets;
