'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import PlaceCard from '../../components/PlaceCard';
import { 
  Search, 
  MapPin, 
  Filter, 
  X, 
  Sparkles, 
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || 'All');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [sortBy, setSortBy] = useState('name');

  const [statesList, setStatesList] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load states for dropdown
  useEffect(() => {
    async function loadStates() {
      try {
        const res = await api.getStates({ activeOnly: true });
        if (res.success) {
          setStatesList(res.data || []);
        }
      } catch (err) {
        console.error('Failed to load states:', err);
      }
    }
    loadStates();
  }, []);

  // Fetch search results whenever filters change
  useEffect(() => {
    let ignore = false;

    async function executeSearch() {
      setLoading(true);
      try {
        const params = {
          q: query.trim() || undefined,
          state: selectedState !== 'All' ? selectedState : undefined,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          sort: sortBy,
        };

        const res = await api.getPlaces(params);
        if (!ignore && res.success) {
          setResults(res.data || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    executeSearch();

    return () => {
      ignore = true;
    };
  }, [query, selectedState, selectedCategory, sortBy]);

  const handleClearFilters = () => {
    setQuery('');
    setSelectedState('All');
    setSelectedCategory('All');
    setSortBy('name');
  };

  const hasActiveFilters = query || selectedState !== 'All' || selectedCategory !== 'All';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Search the Indian Tourism Encyclopedia
        </h1>
        <p className="text-sm text-slate-600">
          Find historical monuments, natural reserves, adventure spots, or sacred pilgrimages across India.
        </p>
      </div>

      {/* Control Panel: Search Bar + Filters */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by monument name, historical description, or region (e.g. Taj Mahal, Fort, Ghats, Pass)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 bg-slate-50 focus:bg-white text-slate-900 text-sm font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs uppercase font-bold text-slate-400 mr-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Category:
            </span>
            {['All', 'Heritage', 'Nature', 'Adventure', 'Religious'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-saffron-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* State Filter Dropdown */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 outline-none focus:border-saffron-500"
              >
                <option value="All">All States & UTs</option>
                {statesList.map((s) => (
                  <option key={s._id} value={s.slug}>
                    {s.name} ({s.type === 'Union Territory' ? 'UT' : 'State'})
                  </option>
                ))}
              </select>
            </div>

            {/* Clear button */}
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-700">
          Found <span className="text-saffron-600 font-bold">{results.length}</span> destinations matching your criteria
        </p>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 space-y-3">
          <Search className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No destinations found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keyword, selecting &apos;All&apos; states, or exploring a different tourism category.
          </p>
          <button
            onClick={handleClearFilters}
            className="mt-2 px-4 py-2 rounded-xl bg-saffron-50 text-saffron-700 font-bold text-xs hover:bg-saffron-100"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((place) => (
            <PlaceCard key={place._id || place.slug} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
