import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Zap, Lock } from 'lucide-react';

export default function AuthUI() {
  const { user, isAuthenticated, login, register, logout, subscription } = useAuth();
  const [showAuth, setShowAuth] = useState(!isAuthenticated);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      setShowAuth(false);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated && showAuth) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">{isLogin ? 'Login' : 'Register'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:border-cyan-500 outline-none"
                required
              />
            </div>
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-4">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-400 hover:text-cyan-300"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>

          <p className="text-xs text-slate-500 mt-4 text-center">
            Demo: demo@example.com / password123
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => setShowAuth(true)}
        className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/50"
      >
        <Lock className="w-4 h-4" />
        Login
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 text-slate-300">
        <User className="w-4 h-4" />
        <span className="text-sm">{user?.email}</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs border border-cyan-500/50">
        <Zap className="w-3 h-3" />
        {subscription.toUpperCase()}
      </div>
      <button
        onClick={logout}
        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
