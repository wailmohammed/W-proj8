import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [subscription, setSubscription] = useState('free');
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.DEV ? 'http://localhost:8000' : '';

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/me`, { params: { token } });
      setUser(res.data);
      setSubscription(res.data.subscription);
    } catch (err) {
      console.error('Error fetching user:', err);
      logout();
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      setToken(res.data.access_token);
      localStorage.setItem('auth_token', res.data.access_token);
      setSubscription(res.data.subscription);
      setUser({ email });
      return res.data;
    } catch (err) {
      throw err.response?.data?.detail || 'Login failed';
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, { email, password });
      setToken(res.data.access_token);
      localStorage.setItem('auth_token', res.data.access_token);
      setSubscription(res.data.subscription);
      setUser({ email });
      return res.data;
    } catch (err) {
      throw err.response?.data?.detail || 'Registration failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setSubscription('free');
    localStorage.removeItem('auth_token');
  };

  const upgradeSubscription = async (tier) => {
    try {
      const res = await axios.post(`${API_BASE}/api/subscription/upgrade`, null, {
        params: { tier, token }
      });
      setSubscription(tier);
      return res.data;
    } catch (err) {
      throw err.response?.data?.detail || 'Upgrade failed';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        subscription,
        loading,
        login,
        register,
        logout,
        upgradeSubscription,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
