/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ComposedChart, Line, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
const API_URL = 'https://stock-tracker-production-01e7.up.railway.app';


// ── Market Summary Bar ────────────────────────────────────────────────────────
function MarketSummary({ allPrices }) {
  const assets = Object.keys(allPrices).filter(t => allPrices[t].latest);
  const changes = assets.map(ticker => {
    const latest = allPrices[ticker].latest;
    const change = (((latest.close - latest.open) / latest.open) * 100).toFixed(2);
    return { ticker, change: parseFloat(change), price: latest.close };
  });

  const gainer = changes.reduce((best, cur) => cur.change > best.change ? cur : best, changes[0]);
  const loser  = changes.reduce((worst, cur) => cur.change < worst.change ? cur : worst, changes[0]);

  return (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' }}>
      <div style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '10px', padding: '16px 20px', minWidth: '160px' }}>
        <p style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '1px', margin: '0 0 6px 0' }}>ASSETS TRACKED</p>
        <p style={{ color: '#f1f5f9', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{assets.length}</p>
      </div>
      <div style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '10px', padding: '16px 20px', minWidth: '160px', borderLeft: '3px solid #16a34a' }}>
        <p style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '1px', margin: '0 0 6px 0' }}>TOP GAINER</p>
        <p style={{ color: '#4ade80', fontSize: '20px', fontWeight: 'bold', margin: '0 0 2px 0' }}>{gainer?.ticker}</p>
        <p style={{ color: '#4ade80', fontSize: '14px', margin: 0 }}>+{gainer?.change}%</p>
      </div>
      <div style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '10px', padding: '16px 20px', minWidth: '160px', borderLeft: '3px solid #dc2626' }}>
        <p style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '1px', margin: '0 0 6px 0' }}>BIGGEST LOSER</p>
        <p style={{ color: '#fca5a5', fontSize: '20px', fontWeight: 'bold', margin: '0 0 2px 0' }}>{loser?.ticker}</p>
        <p style={{ color: '#fca5a5', fontSize: '14px', margin: 0 }}>{loser?.change}%</p>
      </div>
      <div style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '10px', padding: '16px 20px', minWidth: '160px' }}>
        <p style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '1px', margin: '0 0 6px 0' }}>DATA SOURCE</p>
        <p style={{ color: '#f1f5f9', fontSize: '16px', fontWeight: 'bold', margin: '0 0 2px 0' }}>Yahoo Finance</p>
        <p style={{ color: '#4ade80', fontSize: '12px', margin: 0 }}>● Live</p>
      </div>
    </div>
  );
}

// ── Stock Card ────────────────────────────────────────────────────────────────
function StockCard({ ticker, onPriceLoad }) {
  const [prices, setPrices] = useState([]);

  const fetchPrices = () => {
    axios.get(`${API_URL}/stocks/${ticker}/prices`)
      .then(response => {
        setPrices(response.data);
        const sorted = [...response.data].sort((a, b) => new Date(a.date) - new Date(b.date));
        const latest = sorted[sorted.length - 1];
        if (onPriceLoad && latest) onPriceLoad(ticker, latest);
      })
      .catch(error => console.error(error));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    volume: p.volume,
  }));

  const priceChange = latest
    ? (((latest.close - latest.open) / latest.open) * 100).toFixed(2)
    : null;

  return (
    <div style={{
      border: '1px solid #1e293b', borderRadius: '12px', padding: '24px',
      margin: '0 0 16px 0', width: '100%', backgroundColor: '#1e293b',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)', boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: '0', fontSize: '24px', color: '#f1f5f9' }}>{ticker}</h2>
        {latest && (
          <span style={{
            backgroundColor: latest.close >= latest.open ? '#166534' : '#991b1b',
            color: latest.close >= latest.open ? '#4ade80' : '#fca5a5',
            padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold'
          }}>
            {latest.close >= latest.open ? '+' : ''}{priceChange}%
          </span>
        )}
      </div>

      {latest ? (
        <>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '8px 0', color: latest.close >= latest.open ? '#16a34a' : '#dc2626' }}>
            ${latest.close.toFixed(2)}
          </p>
          <p style={{ color: '#94a3b8', margin: '4px 0' }}>Open: ${latest.open.toFixed(2)}</p>
          <p style={{ color: '#94a3b8', margin: '4px 0' }}>Volume: {latest.volume?.toLocaleString()}</p>
          <p style={{ color: '#94a3b8', margin: '4px 0' }}>{new Date(latest.date).toLocaleDateString()}</p>

          <div style={{ marginTop: '24px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis yAxisId="price" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis yAxisId="volume" orientation="right" tick={{ fontSize: 8, fill: '#475569' }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', color: '#f1f5f9' }}
                  formatter={(value, name) => {
                    if (name === 'volume') return [`${(value / 1000000).toFixed(1)}M`, 'Volume'];
                    return [`$${value.toFixed(2)}`, 'Close'];
                  }}
                />
                <Bar yAxisId="volume" dataKey="volume" fill="#334155" opacity={0.6} />
                <Line yAxisId="price" type="monotone" dataKey="close" stroke="#7c3aed" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p style={{ color: '#94a3b8' }}>Loading...</p>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [allPrices, setAllPrices] = useState({});

  const handlePriceLoad = (ticker, latest) => {
    setAllPrices(prev => ({ ...prev, [ticker]: { latest } }));
  };

  const tickers = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'NVDA', 'AMD', 'AMZN', 'META', 'NFLX', 'BTC-USD', 'ETH-USD', 'SOL-USD', 'XRP-USD', 'BNB-USD', 'DOGE-USD'];
  const summaryReady = Object.keys(allPrices).length === tickers.length;

  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif', backgroundColor: '#0f172a', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '8px', color: '#f1f5f9' }}>Stock Tracker Dashboard</h1>
      <p style={{ color: '#94a3b8', marginBottom: '24px' }}>Live prices from Yahoo Finance</p>

      {summaryReady && <MarketSummary allPrices={allPrices} />}

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: '#94a3b8', fontSize: '14px', letterSpacing: '2px', marginBottom: '12px' }}>STOCKS</h2>
          <StockCard ticker="AAPL" onPriceLoad={handlePriceLoad} />
          <StockCard ticker="TSLA" onPriceLoad={handlePriceLoad} />
          <StockCard ticker="GOOGL" onPriceLoad={handlePriceLoad} />
          <StockCard ticker="MSFT" onPriceLoad={handlePriceLoad} />
          <StockCard ticker="NVDA" onPriceLoad={handlePriceLoad} />
          <StockCard ticker="AMD" onPriceLoad={handlePriceLoad} />
          <StockCard ticker="AMZN" onPriceLoad={handlePriceLoad} />
          <StockCard ticker="META" onPriceLoad={handlePriceLoad} />
         <StockCard ticker="NFLX" onPriceLoad={handlePriceLoad} />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ color: '#94a3b8', fontSize: '14px', letterSpacing: '2px', marginBottom: '12px' }}>CRYPTO</h2>
          <StockCard ticker="BTC-USD" onPriceLoad={handlePriceLoad} />
          <StockCard ticker="ETH-USD" onPriceLoad={handlePriceLoad} />
          <StockCard ticker="SOL-USD" onPriceLoad={handlePriceLoad} />
          <StockCard ticker="XRP-USD" onPriceLoad={handlePriceLoad} />
          <StockCard ticker="BNB-USD" onPriceLoad={handlePriceLoad} />
          <StockCard ticker="DOGE-USD" onPriceLoad={handlePriceLoad} />
        </div>
      </div>
    </div>
  );
}

export default App;
