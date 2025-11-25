import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Chart from './components/Chart';
import Trading from './components/Trading';
import Watchlist from './components/Watchlist';
import Portfolio from './components/Portfolio';
import Markets from './components/Markets';
import './App.css';

type TabType = 'chart' | 'trading' | 'watchlist' | 'portfolio' | 'markets';

interface SelectedSymbol {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('chart');
  const [selectedSymbol, setSelectedSymbol] = useState<SelectedSymbol>({
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 178.45,
    change: 2.15,
    changePercent: 1.22
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'chart':
        return <Chart symbol={selectedSymbol} />;
      case 'trading':
        return <Trading symbol={selectedSymbol} />;
      case 'watchlist':
        return <Watchlist onSymbolSelect={setSelectedSymbol} />;
      case 'portfolio':
        return <Portfolio />;
      case 'markets':
        return <Markets onSymbolSelect={setSelectedSymbol} />;
      default:
        return <Chart symbol={selectedSymbol} />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">Sierra Chart Mobile</h1>
          <div className="symbol-info">
            <span className="symbol">{selectedSymbol.symbol}</span>
            <span className="price">${selectedSymbol.price.toFixed(2)}</span>
            <span className={`change ${selectedSymbol.change >= 0 ? 'positive' : 'negative'}`}>
              {selectedSymbol.change >= 0 ? '+' : ''}{selectedSymbol.change.toFixed(2)} ({selectedSymbol.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </header>

      <main className="app-main">
        {renderContent()}
      </main>

      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'chart' ? 'active' : ''}`}
          onClick={() => setActiveTab('chart')}
        >
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Chart</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'trading' ? 'active' : ''}`}
          onClick={() => setActiveTab('trading')}
        >
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span>Trade</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'watchlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('watchlist')}
        >
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Watch</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Portfolio</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'markets' ? 'active' : ''}`}
          onClick={() => setActiveTab('markets')}
        >
          <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Markets</span>
        </button>
      </nav>

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
