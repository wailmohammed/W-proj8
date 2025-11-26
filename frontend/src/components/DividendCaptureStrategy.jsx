import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Calculator } from 'lucide-react';
import axios from 'axios';

export default function DividendCaptureStrategy({ ticker, data = {} }) {
  const { subscription } = useAuth();
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subscription === 'free') return;

    const fetchStrategy = async () => {
      setLoading(true);
      try {
        const API_BASE = import.meta.env.DEV ? 'http://localhost:8000' : '';
        const res = await axios.post(`${API_BASE}/api/dividend/capture-strategy`, {
          ticker,
          ex_dividend_date: data.exDividendDate || '2024-03-15',
          dividend_amount: data.dividendAmount || 0.5,
          current_price: data.currentPrice || 100,
          holding_period_days: data.holdingPeriodDays || 60
        });
        setStrategy(res.data);
      } catch (err) {
        console.error('Failed to fetch strategy:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategy();
  }, [ticker, subscription]);

  if (subscription === 'free') {
    return (
      <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 text-center">
        <p className="text-slate-400 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          Capture Strategy available in Premium/Elite plans
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-6 animate-pulse">
        <div className="h-32 bg-slate-600 rounded"></div>
      </div>
    );
  }

  if (!strategy) return null;

  return (
    <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-slate-600 rounded-lg p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Calculator className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-semibold text-white">Dividend Capture Strategy</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 rounded p-3">
          <p className="text-xs text-slate-400 mb-1">Recommended</p>
          <p className={`font-semibold ${strategy.recommended ? 'text-green-400' : 'text-orange-400'}`}>
            {strategy.recommended ? 'Buy' : 'Hold'}
          </p>
        </div>
        <div className="bg-slate-800/50 rounded p-3">
          <p className="text-xs text-slate-400 mb-1">Risk Level</p>
          <p className={`font-semibold ${
            strategy.risk_level === 'Low' ? 'text-green-400' : 
            strategy.risk_level === 'Medium' ? 'text-yellow-400' : 
            'text-red-400'
          }`}>
            {strategy.risk_level}
          </p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded p-3">
        <p className="text-xs text-slate-400 mb-2">Dividend Analysis</p>
        <div className="space-y-1 text-sm text-slate-300">
          <p>Pre-tax yield: <span className="text-cyan-400 font-semibold">{strategy.dividend_yield_pretax.toFixed(3)}%</span></p>
          <p>After-tax yield: <span className="text-cyan-400 font-semibold">{strategy.dividend_yield_aftertax.toFixed(3)}%</span></p>
          <p>Tax rate: <span className="text-orange-400 font-semibold">{strategy.tax_rate.toFixed(1)}%</span></p>
          <p>Qualified dividend: <span className={`font-semibold ${strategy.is_qualified_dividend ? 'text-green-400' : 'text-red-400'}`}>
            {strategy.is_qualified_dividend ? 'Yes' : 'No'}
          </span></p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded p-3">
        <p className="text-xs text-slate-400 mb-2">Return Scenarios (after {strategy.holding_period_days} days)</p>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded">
            <span className="text-slate-300">Bullish (+5%)</span>
            <div className="text-right">
              <p className="text-green-400 font-semibold">{strategy.scenarios.bullish.total_return_pct.toFixed(2)}%</p>
              <p className="text-slate-400 text-xs">${strategy.scenarios.bullish.future_price.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded">
            <span className="text-slate-300">Neutral</span>
            <div className="text-right">
              <p className="text-yellow-400 font-semibold">{strategy.scenarios.neutral.total_return_pct.toFixed(2)}%</p>
              <p className="text-slate-400 text-xs">${strategy.scenarios.neutral.future_price.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex justify-between items-center p-2 bg-slate-900/50 rounded">
            <span className="text-slate-300">Bearish (-5%)</span>
            <div className="text-right">
              <p className="text-red-400 font-semibold">{strategy.scenarios.bearish.total_return_pct.toFixed(2)}%</p>
              <p className="text-slate-400 text-xs">${strategy.scenarios.bearish.future_price.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded p-3">
        <p className="text-xs text-slate-400 mb-1">Expected Return</p>
        <p className="text-lg font-semibold text-cyan-400">{strategy.expected_return_pct.toFixed(2)}%</p>
      </div>
    </div>
  );
}
