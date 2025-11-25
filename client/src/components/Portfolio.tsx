import React, { useState } from 'react';

interface Position {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPercent: number;
  type: 'stock' | 'crypto' | 'futures' | 'forex';
  exchange: string;
}

const Portfolio: React.FC = () => {
  const [positions] = useState<Position[]>([
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      quantity: 100,
      avgPrice: 170.25,
      currentPrice: 178.45,
      marketValue: 17845.00,
      gainLoss: 820.00,
      gainLossPercent: 4.82,
      type: 'stock',
      exchange: 'NASDAQ',
    },
    {
      symbol: 'BTCUSD',
      name: 'Bitcoin',
      quantity: 0.5,
      avgPrice: 40000.00,
      currentPrice: 43250.50,
      marketValue: 21625.25,
      gainLoss: 1625.25,
      gainLossPercent: 8.13,
      type: 'crypto',
      exchange: 'Binance',
    },
    {
      symbol: 'ESZ23',
      name: 'E-mini S&P 500 Dec 23',
      quantity: 2,
      avgPrice: 4550.00,
      currentPrice: 4563.25,
      marketValue: 9126.50,
      gainLoss: 26.50,
      gainLossPercent: 0.29,
      type: 'futures',
      exchange: 'CME',
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      quantity: 50,
      avgPrice: 250.00,
      currentPrice: 242.84,
      marketValue: 12142.00,
      gainLoss: -358.00,
      gainLossPercent: -2.87,
      type: 'stock',
      exchange: 'NASDAQ',
    },
  ]);

  const totalMarketValue = positions.reduce((sum, pos) => sum + pos.marketValue, 0);
  const totalGainLoss = positions.reduce((sum, pos) => sum + pos.gainLoss, 0);
  const totalGainLossPercent = (totalGainLoss / (totalMarketValue - totalGainLoss)) * 100;

  const accountBalance = 25000.00;
  const totalValue = totalMarketValue + accountBalance;

  return (
    <div className="portfolio-container">
      <div className="portfolio-summary">
        <div className="summary-card">
          <span className="summary-label">Total Value</span>
          <span className="summary-value">${totalValue.toFixed(2)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Positions Value</span>
          <span className="summary-value">${totalMarketValue.toFixed(2)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Cash Balance</span>
          <span className="summary-value">${accountBalance.toFixed(2)}</span>
        </div>
        <div className="summary-card">
          <span className="summary-label">Total P&L</span>
          <span className={`summary-value ${totalGainLoss >= 0 ? 'positive' : 'negative'}`}>
            {totalGainLoss >= 0 ? '+' : ''}${totalGainLoss.toFixed(2)}
            <span className="summary-percent">({totalGainLossPercent.toFixed(2)}%)</span>
          </span>
        </div>
      </div>

      <div className="positions-section">
        <h3>Positions</h3>
        <div className="positions-list">
          {positions.map((position) => (
            <div key={position.symbol} className="position-item">
              <div className="position-header">
                <div className="position-symbol-info">
                  <span className="position-symbol">{position.symbol}</span>
                  <span className="exchange-badge">{position.exchange}</span>
                </div>
                <div className={`position-pl ${position.gainLoss >= 0 ? 'positive' : 'negative'}`}>
                  {position.gainLoss >= 0 ? '+' : ''}${position.gainLoss.toFixed(2)}
                  <span className="pl-percent">({position.gainLossPercent.toFixed(2)}%)</span>
                </div>
              </div>

              <div className="position-name">{position.name}</div>

              <div className="position-details">
                <div className="detail-row">
                  <span className="detail-label">Quantity:</span>
                  <span className="detail-value">{position.quantity}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Avg Price:</span>
                  <span className="detail-value">${position.avgPrice.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Current Price:</span>
                  <span className="detail-value">${position.currentPrice.toFixed(2)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Market Value:</span>
                  <span className="detail-value">${position.marketValue.toFixed(2)}</span>
                </div>
              </div>

              <div className="position-actions">
                <button className="action-btn buy">Buy More</button>
                <button className="action-btn sell">Sell</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="performance-section">
        <h3>Performance</h3>
        <div className="performance-stats">
          <div className="stat-item">
            <span className="stat-label">Today's P&L</span>
            <span className="stat-value positive">+$1,245.50 (+1.68%)</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Week's P&L</span>
            <span className="stat-value positive">+$3,820.25 (+5.32%)</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Month's P&L</span>
            <span className="stat-value negative">-$542.75 (-0.73%)</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Year's P&L</span>
            <span className="stat-value positive">+$12,450.00 (+19.85%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
