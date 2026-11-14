'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '../../../components/AdminGuard';
import { api } from '../../../lib/api';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  ArrowLeft, 
  X, 
  AlertCircle, 
  Check, 
  ExternalLink 
} from 'lucide-react';

export default function AdminStatesPage() {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingState, setEditingState] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'State',
    capital: '',
    description: '',
    heroImage: '',
    isActive: true,
  });

  const loadStates = async () => {
    try {
      setLoading(true);
      const res = await api.getStates({ activeOnly: false });
      if (res.success) {
        setStates(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStates();
  }, []);

  const openCreateModal = () => {
    setEditingState(null);
    setFormData({
      name: '',
      slug: '',
      type: 'State',
      capital: '',
      description: '',
      heroImage: '',
      isActive: true,
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (st) => {
    setEditingState(st);
    setFormData({
      name: st.name,
      slug: st.slug,
      type: st.type,
      capital: st.capital,
      description: st.description,
      heroImage: st.heroImage || '',
      isActive: st.isActive ?? true,
    });
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (editingState) {
        await api.updateState(editingState._id, formData);
      } else {
        await api.createState(formData);
      }
      setModalOpen(false);
      loadStates();
    } catch (err) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete state "${name}"?`)) {
      return;
    }

    try {
      await api.deleteState(id);
      loadStates();
    } catch (err) {
      alert(err.message || 'Failed to delete state');
    }
  };

  const filtered = states.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.capital.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminGuard>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add State / UT
          </button>
        </div>

        {/* Header & Search */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">Manage States & Union Territories</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Total {states.length} administrative entities registered.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter states or capital..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-saffron-500/20"
            />
          </div>
        </div>

        {/* States Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Entity Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Capital</th>
                  <th className="py-3 px-4">Places</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        {st.heroImage && (
                          <img
                            src={st.heroImage}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div>
                          <span>{st.name}</span>
                          <span className="block text-[10px] text-slate-400 font-mono">
                            /{st.slug}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          st.type === 'Union Territory'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {st.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">{st.capital}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{st.placesCount ?? 0}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          st.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {st.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/states/${st.slug}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-slate-600 inline-block"
                        title="View Public Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => openEditModal(st)}
                        className="p-1.5 text-slate-600 hover:text-saffron-600 inline-block"
                        title="Edit State"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(st._id, st.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 inline-block"
                        title="Delete State"
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

        {/* Create / Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  {editingState ? 'Edit State / UT' : 'Add New State / UT'}
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
                    State / UT Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rajasthan"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-800 bg-white"
                    >
                      <option value="State">State</option>
                      <option value="Union Territory">Union Territory</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Capital City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.capital}
                      onChange={(e) => setFormData({ ...formData, capital: e.target.value })}
                      placeholder="e.g. Jaipur"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Custom Slug (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated if empty"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Hero Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.heroImage}
                    onChange={(e) => setFormData({ ...formData, heroImage: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Comprehensive overview of this region's culture, topography, and history..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-saffron-600 focus:ring-saffron-500 w-4 h-4"
                  />
                  <label htmlFor="isActive" className="font-semibold text-slate-700">
                    Visible to Public (Active)
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
                    className="px-5 py-2 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold shadow-sm"
                  >
                    {submitting ? 'Saving...' : editingState ? 'Update State' : 'Create State'}
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
