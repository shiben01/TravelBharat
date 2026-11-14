import React from 'react';
import Link from 'next/link';
import { Compass, Heart, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-saffron-600 to-amber-500 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Travel<span className="text-saffron-500">Bharat</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              TravelBharat is a curated, open digital encyclopedia chronicling the awe-inspiring heritage, breathtaking natural landscapes, exhilarating adventures, and timeless spiritual destinations across all Indian States and Union Territories.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Read-only public tourism reference.</span>
              <span>•</span>
              <span>No bookings or commercial solicitations.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Explore India
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/states" className="hover:text-saffron-400 transition-colors">
                  States & Union Territories
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-saffron-400 transition-colors">
                  Browse by Category
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-saffron-400 transition-colors">
                  Universal Place Search
                </Link>
              </li>
              <li>
                <Link href="/search?category=Heritage" className="hover:text-saffron-400 transition-colors">
                  Heritage Monuments
                </Link>
              </li>
              <li>
                <Link href="/search?category=Nature" className="hover:text-saffron-400 transition-colors">
                  Nature & Scenic Spots
                </Link>
              </li>
            </ul>
          </div>

          {/* Encyclopedia Governance */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Administration
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/admin/login" className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  Admin Login
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition-colors">
                  Content Management Console
                </Link>
              </li>
              <li>
                <a
                  href="https://incredibleindia.gov.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-slate-200 transition-colors"
                >
                  Ministry of Tourism (Incredible India)
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} TravelBharat Encyclopedia. Dedicated to celebrating the spirit of Incredible India.</p>
          <p className="flex items-center gap-1 text-slate-400">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for travelers & culture enthusiasts.
          </p>
        </div>
      </div>
    </footer>
  );
}
