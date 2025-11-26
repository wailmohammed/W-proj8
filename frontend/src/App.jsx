import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { TrendingUp, Search, Loader, AlertCircle } from 'lucide-react';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import './index.css';
import AuthUI from './components/AuthUI';
import { AuthProvider, useAuth } from './context/AuthContext';
import ViewToggle from './components/ViewToggle';
import DividendSafetyScore from './components/DividendSafetyScore';
import DividendCaptureStrategy from './components/DividendCaptureStrategy';
import SubscriptionPlans from './components/SubscriptionPlans';

function AppContent() {
  const { subscription } = useAuth();
  const [ticker, setTicker] = useState('AAPL');
  const [price, setPrice] = useState(null);
  const [historical, setHistorical] = useState([]);
  const [dividends, setDividends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">W-proj8 Stock Tracker</h1>
            </div>
            <AuthUI />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="Search ticker (AAPL, TSLA, MSFT...)"
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                onKeyPress={(e) => e.key === 'Enter' && loadData()}
              />
            </div>
            <button 
              onClick={loadData} 
              disabled={loading} 
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2 transition-all"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {loading ? 'Loading' : 'Search'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {price && !price.error ? (
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-lg p-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-slate-400 text-sm mb-2">Current Price</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-5xl font-bold text-white">${price.price.toFixed(2)}</h2>
                    <span className="text-slate-400 text-sm">({price.ticker})</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-2">Source: {price.source} • {new Date(price.timestamp).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Chart Card */}
            <div className="bg-slate-700 border border-slate-600 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4">30-Day Price History</h3>
              <div className="bg-slate-800 rounded-lg p-4" style={{ height: '300px' }}>
                <Line options={options} data={chartData} />
              </div>
            </div>

            {/* Dividends Card */}
            <div className="bg-slate-700 border border-slate-600 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Dividend Analysis</h3>
                <ViewToggle activeView={viewMode} onViewChange={setViewMode} />
              </div>

              {/* Dividend Safety Score - Premium Only */}
              {subscription !== 'free' && (
                <DividendSafetyScore ticker={ticker} data={{
                  payoutRatio: 30,
                  earningsGrowth: 5,
                  debtToEquity: 0.5,
                  fcfTrend: 5
                }} />
              )}

              {/* Dividend Capture Strategy - Premium Only */}
              {subscription !== 'free' && (
                <DividendCaptureStrategy ticker={ticker} data={{
                  exDividendDate: '2024-03-15',
                  dividendAmount: 0.5,
                  currentPrice: price?.price || 100,
                  holdingPeriodDays: 60
                }} />
              )}

              {/* List View */}
              {viewMode === 'list' && (
                dividends.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-600">
                          <th className="text-left text-slate-300 font-semibold px-4 py-2">Date</th>
                          <th className="text-right text-slate-300 font-semibold px-4 py-2">Amount</th>
                          <th className="text-right text-slate-300 font-semibold px-4 py-2">Est. Yield</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dividends.map((div, index) => (
                          <tr key={index} className="border-b border-slate-600/50 hover:bg-slate-600/30 transition-colors">
                            <td className="text-slate-200 px-4 py-3">{new Date(div.date).toLocaleDateString()}</td>
                            <td className="text-right text-cyan-400 font-semibold px-4 py-3">${div.amount.toFixed(4)}</td>
                            <td className="text-right text-slate-300 px-4 py-3">{((div.amount / price.price) * 100).toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 py-8">
                    <AlertCircle className="w-4 h-4" />
                    <p>No dividend history available for {ticker}</p>
                  </div>
                )
              )}

              {/* Calendar View */}
              {viewMode === 'calendar' && (
                <div className="bg-slate-800/50 rounded-lg p-4 text-center text-slate-400">
                  <p className="text-sm">Calendar view showing dividend payment schedule</p>
                  <div className="mt-4 grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-xs font-semibold text-slate-300">{day}</div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-4">Calendar feature available in Premium plan</p>
                </div>
              )}

              {/* Chart View */}
              {viewMode === 'chart' && (
                <div className="bg-slate-800/50 rounded-lg p-4 text-center text-slate-400">
                  <p className="text-sm">Dividend history chart</p>
                  <div className="h-48 flex items-center justify-center text-slate-500">
                    Chart visualization coming soon
                  </div>
                </div>
              )}
            </div>

            {/* Subscription Plans */}
            <div className="mt-8">
              <SubscriptionPlans />
            </div>
          </div>
        ) : price?.error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 flex items-center gap-3 text-red-200">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error fetching data</p>
              <p className="text-sm">{price.error}. Try a valid ticker like AAPL, MSFT, or TSLA.</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Loading market data...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
