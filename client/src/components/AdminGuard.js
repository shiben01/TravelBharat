'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function AdminGuard({ children }) {
  const { admin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !admin) {
      router.replace('/admin/login');
    }
  }, [admin, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
          Verifying Admin Access...
        </p>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500" />
        <h2 className="text-xl font-bold text-slate-800">Admin Authentication Required</h2>
        <p className="text-xs text-slate-500">Redirecting to login portal...</p>
      </div>
    );
  }

  return children;
}
