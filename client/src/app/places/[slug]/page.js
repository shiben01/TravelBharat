'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import CategoryBadge from '../../../components/CategoryBadge';
import PlaceCard from '../../../components/PlaceCard';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Tag, 
  ExternalLink, 
  Landmark, 
  ChevronRight, 
  ArrowLeft, 
  Info, 
  History, 
  Image as ImageIcon 
} from 'lucide-react';

export default function PlaceDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const [place, setPlace] = useState(null);
  const [relatedPlaces, setRelatedPlaces] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    async function loadPlace() {
      try {
        setLoading(true);
        const res = await api.getPlaceBySlug(slug);
        if (res.success && res.data) {
          setPlace(res.data);
          setRelatedPlaces(res.relatedPlaces || []);
          
          // Set primary image index
          if (res.data.images && res.data.images.length > 0) {
            const primaryIdx = res.data.images.findIndex((img) => img.isPrimary);
            setActiveImageIndex(primaryIdx !== -1 ? primaryIdx : 0);
          }
        } else {
          setError('Place not found in encyclopedia');
        }
      } catch (err) {
        setError(err.message || 'Error loading place');
      } finally {
        setLoading(false);
      }
    }
    loadPlace();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="h-96 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="h-40 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Place Not Found</h2>
        <p className="text-slate-600">{error || "The destination requested does not exist."}</p>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-saffron-600 text-white font-medium text-sm shadow hover:bg-saffron-700"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>
      </div>
    );
  }

  const {
    name,
    category,
    description,
    historicalSignificance,
    bestTimeToVisit,
    entryFee,
    timings,
    mapLink,
    images = [],
    state,
    city,
  } = place;

  const currentImage = images[activeImageIndex] || {
    url: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
    caption: name,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 flex-wrap">
        <Link href="/" className="hover:text-saffron-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/states" className="hover:text-saffron-600">States & UTs</Link>
        {state && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/states/${state.slug}`} className="hover:text-saffron-600">
              {state.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">{name}</span>
      </nav>

      {/* 2. Place Header Title Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryBadge category={category} size="lg" />
            {state && (
              <Link
                href={`/states/${state.slug}`}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-saffron-600" />
                {city?.name ? `${city.name}, ` : ''}{state.name}
              </Link>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            {name}
          </h1>
        </div>

        {mapLink && (
          <div>
            <a
              href={mapLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-semibold text-sm shadow-md transition-all hover:scale-105 shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on Google Maps</span>
            </a>
          </div>
        )}
      </div>

      {/* 3. Photo Gallery */}
      <div className="space-y-4">
        <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[16/9] sm:aspect-[21/9] bg-slate-950">
          <img
            src={currentImage.url}
            alt={currentImage.caption || name}
            className="w-full h-full object-cover"
          />
          {currentImage.caption && (
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 text-white">
              <p className="text-xs sm:text-sm font-medium flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />
                {currentImage.caption}
              </p>
            </div>
          )}
        </div>

        {/* Thumbnails Row */}
        {images.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative rounded-xl overflow-hidden w-28 sm:w-36 aspect-[16/10] shrink-0 border-2 transition-all ${
                  activeImageIndex === idx
                    ? 'border-saffron-600 ring-2 ring-saffron-400/50 scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                {img.isPrimary && (
                  <span className="absolute top-1 left-1 bg-amber-500 text-[9px] font-bold text-slate-950 px-1.5 py-0.5 rounded">
                    Primary
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4. Quick Facts Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-saffron-50 text-saffron-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
              Best Time to Visit
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug mt-0.5 block">
              {bestTimeToVisit || 'Throughout the year'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
              Timings / Hours
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug mt-0.5 block">
              {timings || 'Sunrise to Sunset'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
              Entry Fee
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug mt-0.5 block">
              {entryFee || 'Free entry'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block">
              Region & Capital
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-800 leading-snug mt-0.5 block">
              {state?.name} {state?.capital ? `(${state.capital})` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Main Narrative & Historical Significance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-saffron-600">
              <Info className="w-5 h-5" />
              <h2 className="text-xl font-bold text-slate-900">About {name}</h2>
            </div>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base font-normal">
              {description}
            </p>
          </div>

          {/* Historical Significance */}
          {historicalSignificance && (
            <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/50 rounded-2xl p-6 sm:p-8 border border-amber-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-amber-800">
                <History className="w-5 h-5" />
                <h2 className="text-xl font-bold text-slate-900">Historical & Cultural Heritage</h2>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
                {historicalSignificance}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar: State Quick Info */}
        {state && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900">Explore {state.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {state.description}
              </p>
              <div className="pt-2">
                <Link
                  href={`/states/${state.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-saffron-50 text-slate-800 hover:text-saffron-800 font-semibold text-xs transition-colors border border-slate-200 hover:border-saffron-200"
                >
                  <MapPin className="w-4 h-4 text-saffron-600" />
                  View all places in {state.name}
                </Link>
              </div>
            </div>

            <div className="bg-slate-950 text-white rounded-2xl p-6 space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                Encyclopedia Note
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Visiting information, operating hours, and entry tariffs are regularly maintained by the TravelBharat editorial team.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 6. Related Attractions */}
      {relatedPlaces && relatedPlaces.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Related Attractions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                More destinations in {state?.name || 'this category'}
              </p>
            </div>
            <Link
              href="/search"
              className="text-xs font-semibold text-saffron-600 hover:underline"
            >
              Browse all
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedPlaces.map((relPlace) => (
              <PlaceCard key={relPlace._id || relPlace.slug} place={relPlace} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
