'use client';

import React from 'react';
import { Landmark, Trees, Compass, Sparkles } from 'lucide-react';

export default function CategoryBadge({ category, size = 'sm', className = '' }) {
  const configs = {
    Heritage: {
      color: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: Landmark,
    },
    Nature: {
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: Trees,
    },
    Adventure: {
      color: 'bg-sky-100 text-sky-900 border-sky-300',
      icon: Compass,
    },
    Religious: {
      color: 'bg-orange-100 text-orange-900 border-orange-300',
      icon: Sparkles,
    },
  };

  const config = configs[category] || {
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: Landmark,
  };

  const Icon = config.icon;
  const sizeClasses = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.color} ${sizeClasses} ${className}`}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'} />
      {category}
    </span>
  );
}
