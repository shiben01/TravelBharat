'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import PlaceCard from '../../../components/PlaceCard';
import { 
  MapPin, 
  Landmark, 
  ChevronRight, 
  Building2, 
  Compass, 
  Layers, 
  ArrowLeft 
} from 'lucide-react';

export default function StateDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [stateData, setStateData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (!slug) return;

    async function loadState() {
      try {
        setLoading(true);
        const res = await api.getStateBySlug(slug);
        if (res.success && res.data) {
          setStateData(res.data);
        } else {
          setError('State or Union Territory not found');
        }
      } catch (err) {
        setError(err.message || 'Error loading state');
      } finally {
        setLoading(false);
      }
    }
    loadState();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="h-96 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !stateData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Region Not Found</h2>
        <p className="text-slate-600">{error || "The state you requested does not exist."}</p>
        <Link
          href="/states"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-saffron-600 text-white font-medium text-sm shadow hover:bg-saffron-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to States Directory
        </Link>
      </div>
    );
  }

  const { name, type, capital, description, heroImage, cities = [], places = [] } = stateData;

  const filteredPlaces =
    selectedCategory === 'All'
      ? places
      : places.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-12 pb-16">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-saffron-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/states" className="hover:text-saffron-600">States & UTs</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-semibold">{name}</span>
        </nav>
      </div>

      {/* Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[380px] sm:min-h-[440px] flex items-end">
          <img
            src={heroImage || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=80'}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Hero Content */}
          <div className="relative z-10 p-6 sm:p-12 text-white max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-saffron-600 text-white shadow-xs">
                {type}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-amber-200">
                <Landmark className="w-3.5 h-3.5 text-amber-400" />
                Capital: {capital}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md">
              {name}
            </h1>

            <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-light">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* Key Cities & Districts */}
      {cities && cities.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-saffron-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Featured Cities & Destinations in {name}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cities.map((city) => (
                <div
                  key={city._id || city.slug}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-300 transition-colors"
                >
                  <h3 className="font-bold text-sm text-slate-800">{city.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {city.description || `Key cultural destination in ${name}.`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tourist Places in this State */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Tourist Places in {name}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Showing {filteredPlaces.length} of {places.length} places
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl">
            {['All', 'Heritage', 'Nature', 'Adventure', 'Religious'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-white text-saffron-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredPlaces.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-700">No places in this category yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select another category or browse all places.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place._id || place.slug} place={place} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
