import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import './index.css';

function App() {
  const [ticker, setTicker] = useState('AAPL');
  const [price, setPrice] = useState(null);
  const [historical, setHistorical] = useState([]);
  const [dividends, setDividends] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.DEV ? 'http://localhost:8000' : '';

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, hRes, dRes] = await Promise.all([
        axios.get(`${API_BASE}/api/price/${ticker}`),
        axios.get(`${API_BASE}/api/historical/${ticker}?days=30`),
        axios.get(`${API_BASE}/api/dividends/${ticker}`)
      ]);
      setPrice(pRes.data);
      setHistorical(hRes.data.data || []);
      setDividends(dRes.data.dividends || []);
    } catch (error) {
      console.error(error);
      alert(`Error for ${ticker}: ${error.response?.data?.error || error.message}`);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [ticker]);

  const chartData = {
    labels: historical.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [{
      label: 'Close Price ($)',
      data: historical.map(d => d.Close),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    }],
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: 'top' }, title: { display: true, text: `${ticker} 30-Day History` } },
  };

  return (
    <div className="app">
      <header className="header">
        <h1>W-proj8 Stock & Dividend Tracker</h1>
        <div className="search-container">
          <input
            type="text"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            placeholder="Enter ticker (e.g., AAPL, TSLA)"
            className="search-input"
            onKeyPress={(e) => e.key === 'Enter' && loadData()}
          />
          <button onClick={loadData} disabled={loading} className="search-button">
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
      </header>

      {price && !price.error ? (
        <main className="main-content">
          <section className="price-section">
            <h2 className="price-title">{price.ticker}: ${price.price.toFixed(2)}</h2>
            <p className="price-meta">Source: {price.source} | Updated: {new Date(price.timestamp).toLocaleString()}</p>
          </section>

          <section className="chart-section">
            <Line options={options} data={chartData} />
          </section>

          <section className="dividends-section">
            <h3>Recent Dividends (Last 10)</h3>
            <table className="dividends-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount ($)</th>
                  <th>Yield Est.</th>
                </tr>
              </thead>
              <tbody>
                {dividends.length > 0 ? (
                  dividends.map((div, index) => (
                    <tr key={index}>
                      <td>{new Date(div.date).toLocaleDateString()}</td>
                      <td>{div.amount.toFixed(4)}</td>
                      <td>{((div.amount / price.price) * 100).toFixed(2)}%</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3}>No dividends found.</td></tr>
                )}
              </tbody>
            </table>
          </section>
        </main>
      ) : price?.error ? (
        <div className="error-section">
          <p className="error-message">Error: {price.error}. Try a valid ticker like AAPL.</p>
        </div>
      ) : (
        <div className="loading-section">Loading data...</div>
      )}
    </div>
  );
}

export default App;
