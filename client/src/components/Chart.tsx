import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface ChartProps {
  symbol: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  };
}

type ChartType = 'candlestick' | 'line' | 'area';
type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

interface Indicator {
  name: string;
  enabled: boolean;
  color: string;
}

const Chart: React.FC<ChartProps> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);

  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1h');
  const [indicators, setIndicators] = useState<Indicator[]>([
    { name: 'SMA 20', enabled: false, color: '#2962FF' },
    { name: 'SMA 50', enabled: false, color: '#FF6D00' },
    { name: 'EMA 12', enabled: false, color: '#00E676' },
    { name: 'Bollinger Bands', enabled: false, color: '#9C27B0' },
    { name: 'RSI', enabled: false, color: '#FF5252' },
    { name: 'MACD', enabled: false, color: '#00BCD4' },
  ]);
  const [showIndicators, setShowIndicators] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart: any = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#1a1a1a' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2B2B43' },
        horzLines: { color: '#2B2B43' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        borderColor: '#2B2B43',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2B2B43',
      },
    });

    chartRef.current = chart;

    // Generate sample data
    const data = generateSampleData();

    if (chartType === 'candlestick') {
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      candlestickSeries.setData(data.candlestick);
      seriesRef.current = candlestickSeries;
    } else if (chartType === 'line') {
      const lineSeries = chart.addLineSeries({
        color: '#2962FF',
        lineWidth: 2,
      });
      lineSeries.setData(data.line);
      seriesRef.current = lineSeries;
    } else if (chartType === 'area') {
      const areaSeries = chart.addAreaSeries({
        topColor: 'rgba(41, 98, 255, 0.4)',
        bottomColor: 'rgba(41, 98, 255, 0.0)',
        lineColor: 'rgba(41, 98, 255, 1)',
        lineWidth: 2,
      });
      areaSeries.setData(data.line);
      seriesRef.current = areaSeries;
    }

    // Add enabled indicators
    indicators.forEach((indicator) => {
      if (indicator.enabled) {
        const indicatorSeries = chart.addLineSeries({
          color: indicator.color,
          lineWidth: 1,
          priceScaleId: '',
        });

        // Generate indicator data based on the main data
        const indicatorData = generateIndicatorData(data.candlestick, indicator.name);
        indicatorSeries.setData(indicatorData);
      }
    });

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [chartType, timeFrame, indicators]);

  const generateSampleData = () => {
    const now = Math.floor(Date.now() / 1000);
    const candlestickData: any[] = [];
    const lineData: any[] = [];

    let basePrice = symbol.price;

    for (let i = 200; i >= 0; i--) {
      const time = now - i * 3600;
      const volatility = basePrice * 0.02;

      const open = basePrice + (Math.random() - 0.5) * volatility;
      const close = open + (Math.random() - 0.5) * volatility;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;

      candlestickData.push({
        time,
        open,
        high,
        low,
        close,
      });

      lineData.push({
        time,
        value: close,
      });

      basePrice = close;
    }

    return { candlestick: candlestickData, line: lineData };
  };

  const generateIndicatorData = (candleData: any[], indicatorName: string) => {
    const data: any[] = [];

    if (indicatorName.startsWith('SMA')) {
      const period = parseInt(indicatorName.split(' ')[1]);
      for (let i = 0; i < candleData.length; i++) {
        if (i >= period - 1) {
          let sum = 0;
          for (let j = 0; j < period; j++) {
            sum += candleData[i - j].close;
          }
          data.push({
            time: candleData[i].time,
            value: sum / period,
          });
        }
      }
    } else if (indicatorName.startsWith('EMA')) {
      const period = parseInt(indicatorName.split(' ')[1]);
      const multiplier = 2 / (period + 1);
      let ema = candleData[0].close;

      data.push({ time: candleData[0].time, value: ema });

      for (let i = 1; i < candleData.length; i++) {
        ema = (candleData[i].close - ema) * multiplier + ema;
        data.push({ time: candleData[i].time, value: ema });
      }
    }

    return data;
  };

  const toggleIndicator = (indicatorName: string) => {
    setIndicators(prev =>
      prev.map(ind =>
        ind.name === indicatorName ? { ...ind, enabled: !ind.enabled } : ind
      )
    );
  };

  return (
    <div className="chart-container">
      <div className="chart-controls">
        <div className="chart-type-selector">
          <button
            className={`control-btn ${chartType === 'candlestick' ? 'active' : ''}`}
            onClick={() => setChartType('candlestick')}
          >
            Candles
          </button>
          <button
            className={`control-btn ${chartType === 'line' ? 'active' : ''}`}
            onClick={() => setChartType('line')}
          >
            Line
          </button>
          <button
            className={`control-btn ${chartType === 'area' ? 'active' : ''}`}
            onClick={() => setChartType('area')}
          >
            Area
          </button>
        </div>

        <div className="timeframe-selector">
          {(['1m', '5m', '15m', '1h', '4h', '1d', '1w'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              className={`control-btn ${timeFrame === tf ? 'active' : ''}`}
              onClick={() => setTimeFrame(tf)}
            >
              {tf}
            </button>
          ))}
        </div>

        <button
          className="control-btn indicators-btn"
          onClick={() => setShowIndicators(!showIndicators)}
        >
          Indicators
        </button>
      </div>

      {showIndicators && (
        <div className="indicators-panel">
          <h3>Technical Indicators</h3>
          <div className="indicators-list">
            {indicators.map((indicator) => (
              <label key={indicator.name} className="indicator-item">
                <input
                  type="checkbox"
                  checked={indicator.enabled}
                  onChange={() => toggleIndicator(indicator.name)}
                />
                <span style={{ color: indicator.color }}>{indicator.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div ref={chartContainerRef} className="chart-wrapper" />

      <div className="chart-stats">
        <div className="stat-item">
          <span className="stat-label">Open:</span>
          <span className="stat-value">${symbol.price.toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">High:</span>
          <span className="stat-value">${(symbol.price * 1.02).toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Low:</span>
          <span className="stat-value">${(symbol.price * 0.98).toFixed(2)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Volume:</span>
          <span className="stat-value">45.2M</span>
        </div>
      </div>
    </div>
  );
};

export default Chart;
