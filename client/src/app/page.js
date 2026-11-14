'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../lib/api';
import PlaceCard from '../components/PlaceCard';
import StateCard from '../components/StateCard';
import CategoryBadge from '../components/CategoryBadge';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Landmark, 
  Trees, 
  Compass, 
  ShieldCheck, 
  BookOpen, 
  Sun,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredPlaces, setFeaturedPlaces] = useState([]);
  const [states, setStates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [placesRes, statesRes, catRes, statsRes] = await Promise.all([
          api.getPlaces({ limit: 8 }),
          api.getStates(),
          api.getCategories(),
          api.getStats(),
        ]);

        if (placesRes.success) setFeaturedPlaces(placesRes.data || []);
        if (statesRes.success) setStates(statesRes.data || []);
        if (catRes.success) setCategories(catRes.data || []);
        if (statsRes.success) setStats(statsRes.data || null);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const filteredPlaces =
    activeCategoryFilter === 'All'
      ? featuredPlaces
      : featuredPlaces.filter((p) => p.category === activeCategoryFilter);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative min-h-[580px] flex items-center justify-center bg-slate-950 overflow-hidden px-4 sm:px-6 lg:px-8 py-20">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=2000&q=85"
            alt="Incredible India Heritage"
            className="w-full h-full object-cover object-center opacity-40 scale-105 animate-in fade-in duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-saffron-500/20 border border-saffron-400/30 text-saffron-300 text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Discover India’s Timeless Tapestry
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            The Digital Encyclopedia of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-400 via-amber-300 to-yellow-200">
              Incredible India
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            A comprehensive, non-commercial guide to India’s 28 States and 8 Union Territories. Browse historical palaces, serene backwaters, high-altitude passes, and sacred river ghats.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl p-2 border-2 border-amber-300/40 focus-within:border-saffron-500 transition-all">
              <Search className="w-6 h-6 text-slate-400 ml-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search monuments, states, or categories (e.g. Taj Mahal, Kerala, Heritage)..."
                className="w-full px-4 py-3 text-slate-800 text-sm sm:text-base outline-none bg-transparent placeholder-slate-400 font-medium"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-600 to-amber-500 hover:from-saffron-700 hover:to-amber-600 text-white font-semibold text-sm shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                <span>Explore</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Categories Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold mr-1">
              Browse Categories:
            </span>
            {['Heritage', 'Nature', 'Adventure', 'Religious'].map((cat) => (
              <Link
                key={cat}
                href={`/categories?selected=${cat}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 backdrop-blur-sm transition-all hover:scale-105"
              >
                <CategoryBadge category={cat} size="sm" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Stats Metric Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl p-6 shadow-xl border border-slate-200/80">
          <div className="flex items-center gap-4 p-3 border-r border-slate-100 last:border-0">
            <div className="w-12 h-12 rounded-xl bg-saffron-50 text-saffron-600 flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {stats?.totalStates || 28}
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Indian States
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 border-r border-slate-100 last:border-0">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {stats?.totalUTs || 8}
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Union Territories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 border-r border-slate-100 last:border-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {stats?.totalPlaces || '100+'}
              </p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Tourist Places
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">100%</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Read-Only Encyclopedia
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Browse by Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-saffron-600">
              Diverse Dimensions
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Explore by Tourism Category
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Journey through four distinct thematic lenses of the subcontinent.
            </p>
          </div>
          <Link
            href="/categories"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-700 hover:text-saffron-800 transition-colors"
          >
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/search?category=${cat.name}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5"
            >
              <img
                src={cat.sampleImage}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-85 group-hover:opacity-75 transition-opacity" />

              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <div className="mb-2">
                  <CategoryBadge category={cat.name} size="sm" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 mt-2 leading-relaxed">
                  {cat.description}
                </p>
                <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-amber-300 font-semibold">
                  <span>{cat.count} Documented Sites</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Tourist Places */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-saffron-600">
              Curated Destinations
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Iconic Places of India
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Select monuments, landscapes, and pilgrimage shrines with rich historical background.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {['All', 'Heritage', 'Nature', 'Adventure', 'Religious'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeCategoryFilter === cat
                    ? 'bg-white text-saffron-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Place Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPlaces.slice(0, 8).map((place) => (
              <PlaceCard key={place._id || place.slug} place={place} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all hover:scale-105"
          >
            Browse All Tourist Attractions <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. States & Union Territories Spotlight */}
      <section className="bg-amber-50/50 py-16 border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-saffron-600">
                Subcontinental Geography
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                States & Union Territories
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Explore India’s diverse administrative regions, state capitals, and local destinations.
              </p>
            </div>
            <Link
              href="/states"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-saffron-700 hover:text-saffron-800 transition-colors"
            >
              View All 36 Regions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {states.slice(0, 6).map((st) => (
              <StateCard key={st._id || st.slug} state={st} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. Pure Encyclopedia Mission Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Verified & Objective Public Reference
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              An Encyclopedia Crafted Exclusively for Cultural Knowledge
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              Unlike commercial travel portals, TravelBharat hosts zero sponsored hotel listings, commercial booking affiliate links, or unverified reviews. It stands as a reliable, academic and tourism reference showcasing verified historical significance, visiting timings, entry fees, and geographic coordinates for travellers worldwide.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/states"
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                Browse Indian States
              </Link>
              <Link
                href="/search"
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider border border-white/20 transition-colors"
              >
                Search Encyclopedia
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
