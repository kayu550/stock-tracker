import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function StockCard({ ticker }) {
  const [prices, setPrices] = useState([]);

  const fetchPrices = () => {
    axios.get(`http://127.0.0.1:8000/stocks/${ticker}/prices`)
      .then(response => setPrices(response.data))
      .catch(error => console.error(error));
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [ticker]);

  const sorted = [...prices]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-10);

  const latest = sorted[sorted.length - 1];

  const chartData = sorted.map(p => ({
    date: new Date(p.date).toLocaleDateString(),
    close: p.close,
    open: p.open,
  }));

  return (
    <div style={{
      border: '1px solid #1e293b',
      borderRadius: '12px',
      padding: '24px',
      margin: '0 0 16px 0',
      width: '100%',
      backgroundColor: '#1e293b',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      boxSizing: 'border-box',
    }}>
      <h2 style={{ margin: '0 0 4px 0', fontSize: '24px', color: '#f1f5f9' }}>{ticker}</h2>
      {latest ? (
        <>
          <p style={{
            fontSize: '36px',
            fontWeight: 'bold',
            margin: '8px 0',
            color: latest.close >= latest.open ? '#16a34a' : '#dc2626'
          }}>
            ${latest.close.toFixed(2)}
          </p>
          <p style={{ color: '#94a3b8', margin: '4px 0' }}>Open: ${latest.open.toFixed(2)}</p>
          <p style={{ color: '#94a3b8', margin: '4px 0' }}>Volume: {latest.volume?.toLocaleString()}</p>
          <p style={{ color: '#94a3b8', margin: '4px 0' }}>{new Date(latest.date).toLocaleDateString()}</p>

          <div style={{ marginTop: '24px' }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: '#f1f5f9' }} />
                <Line type="monotone" dataKey="close" stroke="#7c3aed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p style={{ color: '#94a3b8' }}>Loading...</p>
      )}
    </div>
  );
}

function App() {
  return (
    <div style={{
      padding: '32px',
      fontFamily: 'sans-serif',
      backgroundColor: '#0f172a',
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px', color: '#f1f5f9' }}>Stock Tracker Dashboard</h1>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Live prices from Yahoo Finance</p>

      <div style={{ display: 'flex', gap: '24px' }}>

        {/* Left column - Stocks */}
        <div style={{ flex: 1 }}>
          <h2 style={{ color: '#94a3b8', fontSize: '14px', letterSpacing: '2px', marginBottom: '12px' }}>STOCKS</h2>
          <StockCard ticker="AAPL" />
          <StockCard ticker="TSLA" />
          <StockCard ticker="GOOGL" />
          <StockCard ticker="MSFT" />
        </div>

        {/* Right column - Crypto */}
        <div style={{ flex: 1 }}>
          <h2 style={{ color: '#94a3b8', fontSize: '14px', letterSpacing: '2px', marginBottom: '12px' }}>CRYPTO</h2>
          <StockCard ticker="BTC-USD" />
          <StockCard ticker="ETH-USD" />
          <StockCard ticker="SOL-USD" />
        </div>

      </div>
    </div>
  );
}

export default App;
