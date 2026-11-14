'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '../../../components/AdminGuard';
import { api } from '../../../lib/api';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  ArrowLeft, 
  X, 
  AlertCircle, 
  MapPin 
} from 'lucide-react';

export default function AdminCitiesPage() {
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedStateFilter, setSelectedStateFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    state: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [citiesRes, statesRes] = await Promise.all([
        api.getCities({ stateId: selectedStateFilter || undefined }),
        api.getStates({ activeOnly: false }),
      ]);
      if (citiesRes.success) setCities(citiesRes.data || []);
      if (statesRes.success) setStates(statesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStateFilter]);

  const openCreateModal = () => {
    setEditingCity(null);
    setFormData({
      name: '',
      slug: '',
      state: states[0]?._id || '',
      description: '',
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (city) => {
    setEditingCity(city);
    setFormData({
      name: city.name,
      slug: city.slug,
      state: city.state?._id || city.state || '',
      description: city.description || '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingCity) {
        await api.updateCity(editingCity._id, formData);
      } else {
        await api.createCity(formData);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete city "${name}"?`)) return;

    try {
      await api.deleteCity(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete city');
    }
  };

  const filtered = cities.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.state?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add City Hub
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">Manage City Hubs</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect regional destination hubs to Indian states.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 outline-none w-full sm:w-auto"
            >
              <option value="">All States / UTs</option>
              {states.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.name}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by city name..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        </div>

        {/* Cities Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">City Hub</th>
                  <th className="py-3 px-4">Belonging State</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((city) => (
                  <tr key={city._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <span>{city.name}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">
                        /{city.slug}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        <MapPin className="w-3 h-3 text-saffron-600" />
                        {city.state?.name || '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-md truncate">
                      {city.description || '—'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(city)}
                        className="p-1.5 text-slate-600 hover:text-emerald-600 inline-block"
                        title="Edit City"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(city._id, city.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 inline-block"
                        title="Delete City"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900">
                  {editingCity ? 'Edit City Hub' : 'Add New City Hub'}
                </h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Udaipur"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    State / UT *
                  </label>
                  <select
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-800 bg-white"
                  >
                    <option value="">Select State</option>
                    {states.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Custom Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated from name if blank"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief highlights of this destination hub..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 text-slate-800"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                  >
                    {submitting ? 'Saving...' : editingCity ? 'Update City' : 'Create City'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
