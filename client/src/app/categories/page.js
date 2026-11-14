'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import PlaceCard from '../../components/PlaceCard';
import CategoryBadge from '../../components/CategoryBadge';
import { Layers, Landmark, Trees, Compass, Sparkles } from 'lucide-react';

function CategoriesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('selected') || 'Heritage';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [categories, setCategories] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.getCategories();
        if (res.success) {
          setCategories(res.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function loadPlaces() {
      try {
        setLoading(true);
        const res = await api.getPlaces({ category: activeCategory });
        if (res.success) {
          setPlaces(res.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadPlaces();
  }, [activeCategory]);

  const currentCatInfo = categories.find((c) => c.name === activeCategory);

  const categoryIcons = {
    Heritage: Landmark,
    Nature: Trees,
    Adventure: Compass,
    Religious: Sparkles,
  };

  const ActiveIcon = categoryIcons[activeCategory] || Landmark;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-50 text-saffron-700 text-xs font-semibold uppercase tracking-wider border border-saffron-200">
          <Layers className="w-3.5 h-3.5" />
          Thematic Classifications
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Explore by Tourism Category
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          Every corner of India offers distinct journeys: from ancient forts and sacred pilgrim routes to Himalayan heights and untamed rainforests.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100 p-2 rounded-2xl">
        {['Heritage', 'Nature', 'Adventure', 'Religious'].map((catName) => {
          const Icon = categoryIcons[catName] || Landmark;
          const isActive = activeCategory === catName;
          const count = categories.find((c) => c.name === catName)?.count;

          return (
            <button
              key={catName}
              onClick={() => setActiveCategory(catName)}
              className={`flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-white text-saffron-700 shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-saffron-600' : 'text-slate-400'}`} />
              <span>{catName}</span>
              {count !== undefined && (
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category Spotlight Header */}
      {currentCatInfo && (
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-12 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <CategoryBadge category={activeCategory} size="lg" />
            <h2 className="text-3xl font-black">{currentCatInfo.name} Destinations</h2>
            <p className="text-sm text-slate-300 leading-relaxed font-light">
              {currentCatInfo.description}
            </p>
          </div>
          <div className="w-full md:w-auto shrink-0 flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
            <ActiveIcon className="w-10 h-10 text-amber-400" />
            <div>
              <p className="text-2xl font-black text-white">{places.length}</p>
              <p className="text-xs uppercase font-semibold text-slate-300 tracking-wider">
                Documented Sites
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Places in this Category */}
      <section className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900">
          Showing {places.length} {activeCategory} Places
        </h3>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <ActiveIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600 font-medium">No places found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <PlaceCard key={place._id || place.slug} place={place} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="h-64 bg-slate-200 rounded-3xl animate-pulse" />
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
