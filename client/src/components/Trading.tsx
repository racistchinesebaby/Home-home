import React, { useState } from 'react';
import toast from 'react-hot-toast';

interface TradingProps {
  symbol: {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  };
}

type OrderType = 'market' | 'limit' | 'stop' | 'stop-limit';
type OrderSide = 'buy' | 'sell';
type TimeInForce = 'day' | 'gtc' | 'ioc' | 'fok';

interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: Date;
}

const Trading: React.FC<TradingProps> = ({ symbol }) => {
  const [orderSide, setOrderSide] = useState<OrderSide>('buy');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [quantity, setQuantity] = useState<string>('100');
  const [limitPrice, setLimitPrice] = useState<string>(symbol.price.toFixed(2));
  const [stopPrice, setStopPrice] = useState<string>((symbol.price * 0.95).toFixed(2));
  const [timeInForce, setTimeInForce] = useState<TimeInForce>('day');
  const [orders, setOrders] = useState<Order[]>([]);

  const calculateTotal = () => {
    const qty = parseFloat(quantity) || 0;
    const price = orderType === 'market' ? symbol.price : parseFloat(limitPrice) || 0;
    return (qty * price).toFixed(2);
  };

  const handlePlaceOrder = () => {
    const newOrder: Order = {
      id: Date.now().toString(),
      symbol: symbol.symbol,
      side: orderSide,
      type: orderType,
      quantity: parseFloat(quantity),
      price: orderType !== 'market' ? parseFloat(limitPrice) : undefined,
      stopPrice: orderType === 'stop' || orderType === 'stop-limit' ? parseFloat(stopPrice) : undefined,
      status: 'pending',
      timestamp: new Date(),
    };

    setOrders([newOrder, ...orders]);

    toast.success(
      `${orderSide.toUpperCase()} order placed: ${quantity} ${symbol.symbol} @ ${
        orderType === 'market' ? 'Market' : `$${limitPrice}`
      }`
    );

    // Simulate order fill after 1-3 seconds
    setTimeout(() => {
      setOrders(prev =>
        prev.map(order =>
          order.id === newOrder.id ? { ...order, status: 'filled' } : order
        )
      );
      toast.success(`Order filled: ${quantity} ${symbol.symbol}`);
    }, Math.random() * 2000 + 1000);
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      )
    );
    toast.success('Order cancelled');
  };

  return (
    <div className="trading-container">
      <div className="order-form">
        <div className="order-side-selector">
          <button
            className={`side-btn buy ${orderSide === 'buy' ? 'active' : ''}`}
            onClick={() => setOrderSide('buy')}
          >
            BUY
          </button>
          <button
            className={`side-btn sell ${orderSide === 'sell' ? 'active' : ''}`}
            onClick={() => setOrderSide('sell')}
          >
            SELL
          </button>
        </div>

        <div className="form-group">
          <label>Order Type</label>
          <select
            className="form-control"
            value={orderType}
            onChange={(e) => setOrderType(e.target.value as OrderType)}
          >
            <option value="market">Market</option>
            <option value="limit">Limit</option>
            <option value="stop">Stop</option>
            <option value="stop-limit">Stop-Limit</option>
          </select>
        </div>

        <div className="form-group">
          <label>Quantity</label>
          <input
            type="number"
            className="form-control"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter quantity"
          />
        </div>

        {(orderType === 'limit' || orderType === 'stop-limit') && (
          <div className="form-group">
            <label>Limit Price</label>
            <input
              type="number"
              className="form-control"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="Enter limit price"
              step="0.01"
            />
          </div>
        )}

        {(orderType === 'stop' || orderType === 'stop-limit') && (
          <div className="form-group">
            <label>Stop Price</label>
            <input
              type="number"
              className="form-control"
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              placeholder="Enter stop price"
              step="0.01"
            />
          </div>
        )}

        <div className="form-group">
          <label>Time in Force</label>
          <select
            className="form-control"
            value={timeInForce}
            onChange={(e) => setTimeInForce(e.target.value as TimeInForce)}
          >
            <option value="day">Day</option>
            <option value="gtc">Good Till Cancel</option>
            <option value="ioc">Immediate or Cancel</option>
            <option value="fok">Fill or Kill</option>
          </select>
        </div>

        <div className="order-summary">
          <div className="summary-row">
            <span>Estimated Total:</span>
            <span className="total-value">${calculateTotal()}</span>
          </div>
        </div>

        <button
          className={`place-order-btn ${orderSide}`}
          onClick={handlePlaceOrder}
        >
          {orderSide === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
        </button>
      </div>

      <div className="orders-section">
        <h3>Recent Orders</h3>
        <div className="orders-list">
          {orders.length === 0 ? (
            <p className="no-orders">No orders yet</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className={`order-item ${order.status}`}>
                <div className="order-header">
                  <span className={`order-side ${order.side}`}>
                    {order.side.toUpperCase()}
                  </span>
                  <span className="order-symbol">{order.symbol}</span>
                  <span className={`order-status ${order.status}`}>
                    {order.status}
                  </span>
                </div>
                <div className="order-details">
                  <span>Type: {order.type.toUpperCase()}</span>
                  <span>Qty: {order.quantity}</span>
                  {order.price && <span>Price: ${order.price.toFixed(2)}</span>}
                  {order.stopPrice && <span>Stop: ${order.stopPrice.toFixed(2)}</span>}
                </div>
                <div className="order-time">
                  {order.timestamp.toLocaleTimeString()}
                </div>
                {order.status === 'pending' && (
                  <button
                    className="cancel-order-btn"
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="account-info">
        <h3>Account Summary</h3>
        <div className="account-stats">
          <div className="stat-card">
            <span className="stat-label">Buying Power</span>
            <span className="stat-value">$50,000.00</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Cash Balance</span>
            <span className="stat-value">$25,000.00</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Portfolio Value</span>
            <span className="stat-value">$75,000.00</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading;
