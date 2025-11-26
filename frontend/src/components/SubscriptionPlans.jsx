import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, CreditCard, Lock, Check } from 'lucide-react';
import axios from 'axios';

const PLANS = {
  free: { price: 0, features: ['Basic price lookup', 'Limited history (30 days)'] },
  premium: { price: 9.99, features: ['Dividend safety scoring', 'Advanced analytics', 'Capture strategy', 'Tax calculator'] },
  elite: { price: 29.99, features: ['All Premium features', 'Portfolio tracking', 'Alerts', 'Unlimited API calls'] }
};

export default function SubscriptionPlans() {
  const { subscription, upgradeSubscription, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState('ethereum');

  const handleUpgrade = async (tier) => {
    if (tier === subscription) return;
    setLoading(true);
    try {
      await upgradeSubscription(tier);
      alert(`Upgraded to ${tier}!`);
    } catch (err) {
      alert(`Upgrade failed: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoPayment = async (tier) => {
    if (!token) {
      alert('Please login first');
      return;
    }
    
    const API_BASE = import.meta.env.DEV ? 'http://localhost:8000' : '';
    const amount = PLANS[tier].price;
    
    try {
      const res = await axios.post(
        `${API_BASE}/api/payment/crypto?crypto_type=${selectedCrypto}&amount=${amount}&token=${token}`
      );
      alert(`Payment initiated!\nTransaction ID: ${res.data.transaction_id}\nWallet: ${res.data.wallet_address}`);
    } catch (err) {
      alert(`Payment failed: ${err.response?.data?.detail || err.message}`);
    }
  };

  return (
    <div className="py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">Subscription Plans</h2>
        <p className="text-slate-400 text-center mb-12">Unlock advanced features for dividend investing</p>

        <div className="grid md:grid-cols-3 gap-6">
          {Object.entries(PLANS).map(([tier, plan]) => (
            <div
              key={tier}
              className={`relative border rounded-lg p-6 transition-all ${
                subscription === tier
                  ? 'bg-cyan-500/10 border-cyan-500 ring-2 ring-cyan-500/50'
                  : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
              }`}
            >
              {subscription === tier && (
                <div className="absolute top-0 right-0 bg-cyan-500 text-white px-3 py-1 rounded-bl-lg text-xs font-semibold">
                  Current
                </div>
              )}

              <h3 className="text-lg font-bold text-white mb-2 capitalize">{tier} Plan</h3>
              <div className="mb-6">
                <span className="text-3xl font-bold text-white">${plan.price}</span>
                <span className="text-slate-400 text-sm">/month</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                    <Check className="w-4 h-4 text-cyan-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              {tier !== 'free' && (
                <>
                  <button
                    onClick={() => handleUpgrade(tier)}
                    disabled={loading || subscription === tier}
                    className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold mb-3 disabled:opacity-50"
                  >
                    {subscription === tier ? 'Current Plan' : 'Upgrade'}
                  </button>

                  <div className="border-t border-slate-600 pt-3">
                    <p className="text-xs text-slate-400 mb-2">Pay with crypto</p>
                    <select
                      value={selectedCrypto}
                      onChange={(e) => setSelectedCrypto(e.target.value)}
                      className="w-full px-3 py-1 bg-slate-800 border border-slate-600 rounded text-slate-200 text-sm mb-2"
                    >
                      <option value="bitcoin">Bitcoin</option>
                      <option value="ethereum">Ethereum</option>
                    </select>
                    <button
                      onClick={() => handleCryptoPayment(tier)}
                      className="w-full px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-3 h-3" />
                      Pay with {selectedCrypto}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
