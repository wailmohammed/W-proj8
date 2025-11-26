import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';

const GRADE_COLORS = {
  A: 'text-green-400 bg-green-500/10 border-green-500/30',
  B: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  C: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  D: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  F: 'text-red-400 bg-red-500/10 border-red-500/30'
};

export default function DividendSafetyScore({ ticker, data = {} }) {
  const { subscription } = useAuth();
  const [safety, setSafety] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (subscription === 'free') return; // Gate behind premium subscription
    
    const fetchSafetyScore = async () => {
      setLoading(true);
      try {
        const API_BASE = import.meta.env.DEV ? 'http://localhost:8000' : '';
        const res = await axios.post(`${API_BASE}/api/dividend/safety-score`, {
          ticker,
          payout_ratio: data.payoutRatio || 30,
          earnings_growth: data.earningsGrowth || 5,
          debt_to_equity: data.debtToEquity || 0.5,
          fcf_trend: data.fcfTrend || 5
        });
        setSafety(res.data);
      } catch (err) {
        console.error('Failed to fetch safety score:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSafetyScore();
  }, [ticker, subscription]);

  if (subscription === 'free') {
    return (
      <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 text-center">
        <p className="text-slate-400 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          Safety Scoring available in Premium/Elite plans
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 animate-pulse">
        <div className="h-12 bg-slate-600 rounded"></div>
      </div>
    );
  }

  if (!safety) return null;

  return (
    <div className={`border rounded-lg p-4 ${GRADE_COLORS[safety.grade]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold opacity-75 mb-1">Dividend Safety</p>
          <p className="text-sm text-slate-300">{safety.label}</p>
        </div>
        <div className="text-4xl font-bold">{safety.grade}</div>
        <div className="text-right">
          <p className="text-2xl font-bold">{safety.score}/100</p>
          <p className={`text-xs font-semibold ${safety.safe ? 'text-green-400' : 'text-red-400'}`}>
            {safety.safe ? '✓ Safe' : '✗ Risky'}
          </p>
        </div>
      </div>
    </div>
  );
}
