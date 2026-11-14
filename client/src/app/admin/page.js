'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '../../components/AdminGuard';
import { api } from '../../lib/api';
import { 
  ShieldCheck, 
  MapPin, 
  Building2, 
  Compass, 
  PlusCircle, 
  ArrowRight, 
  Layers, 
  ExternalLink,
  Edit,
  Trash2
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [recentPlaces, setRecentPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [statsRes, placesRes] = await Promise.all([
          api.getStats(),
          api.getPlaces({ limit: 6, sort: 'newest' }),
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (placesRes.success) setRecentPlaces(placesRes.data || []);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500 text-white">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                TravelBharat Editorial Console
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Manage Indian states, territorial districts, cities, and heritage tourist destinations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/places"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Add Destination
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/states"
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                States
              </span>
              <MapPin className="w-4 h-4 text-saffron-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {stats?.totalStates ?? '-'}
            </p>
            <span className="text-xs text-saffron-600 font-semibold flex items-center gap-1 mt-3">
              Manage States <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/admin/states"
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Union Territories
              </span>
              <Layers className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {stats?.totalUTs ?? '-'}
            </p>
            <span className="text-xs text-purple-600 font-semibold flex items-center gap-1 mt-3">
              Manage UTs <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/admin/cities"
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Cities / Hubs
              </span>
              <Building2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {stats?.totalCities ?? '-'}
            </p>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-3">
              Manage Cities <ArrowRight className="w-3 h-3" />
            </span>
          </Link>

          <Link
            href="/admin/places"
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-sky-400 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Tourist Places
              </span>
              <Compass className="w-4 h-4 text-sky-500 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-3xl font-black text-slate-900 mt-2">
              {stats?.totalPlaces ?? '-'}
            </p>
            <span className="text-xs text-sky-600 font-semibold flex items-center gap-1 mt-3">
              Manage Places <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>

        {/* Quick Nav Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-saffron-600" />
              <h2 className="font-bold text-slate-900">States & UTs Directory</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Create new administrative entities, modify state capitals, update descriptions, and toggle active status.
            </p>
            <Link
              href="/admin/states"
              className="inline-flex items-center gap-1 text-xs font-bold text-saffron-700 hover:text-saffron-800"
            >
              Open States Manager →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900">City & District Hubs</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Define travel hubs, connect them with corresponding Indian states, and categorize regional points of transit.
            </p>
            <Link
              href="/admin/cities"
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Open Cities Manager →
            </Link>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-sky-600" />
              <h2 className="font-bold text-slate-900">Tourist Destinations</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Author rich monuments, set historical significance, manage multi-image photo galleries, timings, and fees.
            </p>
            <Link
              href="/admin/places"
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-800"
            >
              Open Places Manager →
            </Link>
          </div>
        </div>

        {/* Recently Added Destinations Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recently Updated Places</h2>
            <Link href="/admin/places" className="text-xs font-semibold text-saffron-600 hover:underline">
              View all places
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Place Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">State</th>
                  <th className="py-3 px-4">Entry Fee</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPlaces.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <Link href={`/places/${p.slug}`} className="hover:text-saffron-600 flex items-center gap-1">
                        {p.name}
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-700">{p.category}</span>
                    </td>
                    <td className="py-3 px-4">{p.state?.name || '—'}</td>
                    <td className="py-3 px-4">{p.entryFee || 'Free'}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/admin/places`}
                        className="text-saffron-600 hover:text-saffron-800 font-semibold inline-flex items-center gap-1"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
