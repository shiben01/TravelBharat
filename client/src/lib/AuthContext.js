'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';

const AuthContext = createContext({
  admin: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshAdmin: async () => {},
});

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await api.getMe();
      if (res.success && res.user) {
        setAdmin(res.user);
      } else {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('tb_auth_token');
        }
        setAdmin(null);
      }
    } catch (err) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tb_auth_token');
      }
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.user) {
      if (res.token && typeof window !== 'undefined') {
        localStorage.setItem('tb_auth_token', res.token);
      }
      setAdmin(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = async () => {
    try {
      await api.logout();
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tb_auth_token');
      }
      setAdmin(null);
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, refreshAdmin: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
