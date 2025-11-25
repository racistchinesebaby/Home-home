import React, { useState, useEffect } from 'react';

interface WatchlistProps {
  onSymbolSelect: (symbol: any) => void;
}

interface WatchlistItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  marketCap: string;
  exchange: string;
  type: 'stock' | 'crypto' | 'futures' | 'forex';
}

const Watchlist: React.FC<WatchlistProps> = ({ onSymbolSelect }) => {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 178.45,
      change: 2.15,
      changePercent: 1.22,
      volume: '52.3M',
      marketCap: '2.8T',
      exchange: 'NASDAQ',
      type: 'stock',
    },
    {
      symbol: 'BTCUSD',
      name: 'Bitcoin',
      price: 43250.50,
      change: 1230.25,
      changePercent: 2.93,
      volume: '28.5B',
      marketCap: '845B',
      exchange: 'Binance',
      type: 'crypto',
    },
    {
      symbol: 'ETHUSD',
      name: 'Ethereum',
      price: 2285.75,
      change: -45.30,
      changePercent: -1.94,
      volume: '12.3B',
      marketCap: '275B',
      exchange: 'Coinbase',
      type: 'crypto',
    },
    {
      symbol: 'ESZ23',
      name: 'E-mini S&P 500 Dec 23',
      price: 4563.25,
      change: 15.50,
      changePercent: 0.34,
      volume: '2.1M',
      marketCap: '-',
      exchange: 'CME',
      type: 'futures',
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 242.84,
      change: -3.56,
      changePercent: -1.45,
      volume: '102.5M',
      marketCap: '770B',
      exchange: 'NASDAQ',
      type: 'stock',
    },
    {
      symbol: 'SOLUSD',
      name: 'Solana',
      price: 58.42,
      change: 3.28,
      changePercent: 5.95,
      volume: '1.2B',
      marketCap: '24B',
      exchange: 'Binance',
      type: 'crypto',
    },
    {
      symbol: 'NQZ23',
      name: 'E-mini NASDAQ Dec 23',
      price: 15842.50,
      change: 82.25,
      changePercent: 0.52,
      volume: '1.5M',
      marketCap: '-',
      exchange: 'CME',
      type: 'futures',
    },
    {
      symbol: 'EURUSD',
      name: 'EUR/USD',
      price: 1.0945,
      change: 0.0023,
      changePercent: 0.21,
      volume: '145B',
      marketCap: '-',
      exchange: 'Forex',
      type: 'forex',
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'stock' | 'crypto' | 'futures' | 'forex'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWatchlist(prev =>
        prev.map(item => {
          const changePercent = (Math.random() - 0.5) * 0.5;
          const change = item.price * (changePercent / 100);
          return {
            ...item,
            price: item.price + change,
            change: item.change + change,
            changePercent: item.changePercent + changePercent,
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const filteredWatchlist = watchlist.filter(item => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch =
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRemoveFromWatchlist = (symbol: string) => {
    setWatchlist(prev => prev.filter(item => item.symbol !== symbol));
  };

  return (
    <div className="watchlist-container">
      <div className="watchlist-header">
        <input
          type="text"
          className="search-input"
          placeholder="Search symbols..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filter === 'stock' ? 'active' : ''}`}
            onClick={() => setFilter('stock')}
          >
            Stocks
          </button>
          <button
            className={`filter-btn ${filter === 'crypto' ? 'active' : ''}`}
            onClick={() => setFilter('crypto')}
          >
            Crypto
          </button>
          <button
            className={`filter-btn ${filter === 'futures' ? 'active' : ''}`}
            onClick={() => setFilter('futures')}
          >
            Futures
          </button>
          <button
            className={`filter-btn ${filter === 'forex' ? 'active' : ''}`}
            onClick={() => setFilter('forex')}
          >
            Forex
          </button>
        </div>
      </div>

      <div className="watchlist-items">
        {filteredWatchlist.map((item) => (
          <div
            key={item.symbol}
            className="watchlist-item"
            onClick={() => onSymbolSelect(item)}
          >
            <div className="item-header">
              <div className="symbol-info">
                <span className="symbol">{item.symbol}</span>
                <span className="exchange-badge">{item.exchange}</span>
              </div>
              <button
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFromWatchlist(item.symbol);
                }}
              >
                ×
              </button>
            </div>
            <div className="item-name">{item.name}</div>
            <div className="item-price-row">
              <span className="price">${item.price.toFixed(2)}</span>
              <span className={`change ${item.change >= 0 ? 'positive' : 'negative'}`}>
                {item.change >= 0 ? '+' : ''}
                {item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="item-stats">
              <span className="stat">Vol: {item.volume}</span>
              {item.marketCap !== '-' && <span className="stat">MCap: {item.marketCap}</span>}
            </div>
          </div>
        ))}
      </div>

      <button className="add-symbol-btn">+ Add Symbol</button>
    </div>
  );
};

export default Watchlist;
