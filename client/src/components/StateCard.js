'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Landmark, ArrowRight } from 'lucide-react';

export default function StateCard({ state }) {
  if (!state) return null;

  const heroImage =
    state.heroImage ||
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';

  return (
    <Link
      href={`/states/${state.slug}`}
      className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl hover:border-amber-400 transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <img
          src={heroImage}
          alt={state.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Type Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md shadow-xs ${
              state.type === 'Union Territory'
                ? 'bg-purple-600/90 text-white'
                : 'bg-saffron-600/90 text-white'
            }`}
          >
            {state.type}
          </span>
        </div>

        {/* State Name & Capital overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-xl font-bold tracking-tight drop-shadow-sm group-hover:text-amber-300 transition-colors">
            {state.name}
          </h3>
          <p className="text-xs text-slate-200 flex items-center gap-1 mt-0.5">
            <Landmark className="w-3.5 h-3.5 text-amber-400" />
            Capital: {state.capital}
          </p>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {state.description}
        </p>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500">
            {state.placesCount !== undefined ? `${state.placesCount} Tourist Places` : 'Explore Places'}
          </span>
          <span className="flex items-center gap-1 font-semibold text-saffron-600 group-hover:translate-x-1 transition-transform">
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
