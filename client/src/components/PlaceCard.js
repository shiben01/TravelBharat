'use client';

import React from 'react';
import Link from 'next/link';
import CategoryBadge from './CategoryBadge';
import { MapPin, Clock, Tag } from 'lucide-react';

export default function PlaceCard({ place }) {
  if (!place) return null;

  // Select primary image or first image
  const primaryImage =
    place.images?.find((img) => img.isPrimary)?.url ||
    place.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80';

  return (
    <Link
      href={`/places/${place.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-amber-300 transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={primaryImage}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        {/* Category Badge Floating Top Left */}
        <div className="absolute top-3 left-3">
          <CategoryBadge category={place.category} />
        </div>

        {/* State Pill Floating Bottom Left */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="inline-flex items-center gap-1 font-medium bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md">
            <MapPin className="w-3.5 h-3.5 text-saffron-400" />
            {place.city?.name ? `${place.city.name}, ` : ''}{place.state?.name || 'India'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-saffron-600 transition-colors line-clamp-1 mb-2">
            {place.name}
          </h3>
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
            {place.description}
          </p>
        </div>

        {/* Quick meta details */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate max-w-[120px]">{place.timings || 'Open daily'}</span>
          </span>
          <span className="flex items-center gap-1 font-semibold text-saffron-700 bg-saffron-50 px-2 py-0.5 rounded">
            <Tag className="w-3 h-3 text-saffron-500" />
            {place.entryFee || 'Free'}
          </span>
        </div>
      </div>
    </Link>
  );
}
