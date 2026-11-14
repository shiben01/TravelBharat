'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import StateCard from '../../components/StateCard';
import { Search, MapPin, Filter, Sparkles } from 'lucide-react';

export default function StatesDirectoryPage() {
  const [states, setStates] = useState([]);
  const [selectedType, setSelectedType] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStates() {
      try {
        setLoading(true);
        const res = await api.getStates({
          type: selectedType === 'All' ? undefined : selectedType,
        });
        if (res.success) {
          setStates(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load states:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStates();
  }, [selectedType]);

  const filteredStates = states.filter((st) => {
    const term = search.toLowerCase();
    return (
      st.name.toLowerCase().includes(term) ||
      st.capital.toLowerCase().includes(term) ||
      st.description.toLowerCase().includes(term)
    );
  });

  const stateCount = states.filter((s) => s.type === 'State').length;
  const utCount = states.filter((s) => s.type === 'Union Territory').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-50 text-saffron-700 text-xs font-semibold uppercase tracking-wider border border-saffron-200">
          <MapPin className="w-3.5 h-3.5" />
          The Indian Subcontinent
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          States & Union Territories
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Browse through India’s 28 States and 8 Union Territories. Each region preserves unique architectural landmarks, languages, regional cuisines, and ecosystems.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Type Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl w-full md:w-auto">
          {[
            { label: 'All Regions', value: 'All' },
            { label: 'States', value: 'State' },
            { label: 'Union Territories', value: 'Union Territory' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedType(tab.value)}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                selectedType === tab.value
                  ? 'bg-white text-saffron-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by state name or capital..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 bg-slate-50 focus:bg-white"
          />
        </div>
      </div>

      {/* States Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filteredStates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No regions found</h3>
          <p className="text-sm text-slate-500 mt-1">Try searching with a different term or clear filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStates.map((st) => (
            <StateCard key={st._id || st.slug} state={st} />
          ))}
        </div>
      )}
    </div>
  );
}
