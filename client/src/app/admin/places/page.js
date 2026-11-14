'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminGuard from '../../../components/AdminGuard';
import { api } from '../../../lib/api';
import CategoryBadge from '../../../components/CategoryBadge';
import { 
  Compass, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  ArrowLeft, 
  X, 
  AlertCircle, 
  MapPin, 
  Image as ImageIcon,
  ExternalLink,
  PlusCircle,
  Star
} from 'lucide-react';

export default function AdminPlacesPage() {
  const [places, setPlaces] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stateFilter, setStateFilter] = useState('All');

  // Modal & Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const initialFormState = {
    name: '',
    slug: '',
    state: '',
    city: '',
    category: 'Heritage',
    description: '',
    historicalSignificance: '',
    bestTimeToVisit: '',
    entryFee: 'Free',
    timings: 'Open daily',
    mapLink: '',
    images: [
      {
        url: '',
        caption: '',
        isPrimary: true,
      },
    ],
  };

  const [formData, setFormData] = useState(initialFormState);

  const loadData = async () => {
    try {
      setLoading(true);
      const [placesRes, statesRes, citiesRes] = await Promise.all([
        api.getPlaces({ limit: 100 }),
        api.getStates({ activeOnly: false }),
        api.getCities(),
      ]);

      if (placesRes.success) setPlaces(placesRes.data || []);
      if (statesRes.success) setStates(statesRes.data || []);
      if (citiesRes.success) setCities(citiesRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingPlace(null);
    setFormData({
      ...initialFormState,
      state: states[0]?._id || '',
      images: [
        {
          url: '',
          caption: '',
          isPrimary: true,
        },
      ],
    });
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (place) => {
    setEditingPlace(place);
    setFormData({
      name: place.name || '',
      slug: place.slug || '',
      state: place.state?._id || place.state || '',
      city: place.city?._id || place.city || '',
      category: place.category || 'Heritage',
      description: place.description || '',
      historicalSignificance: place.historicalSignificance || '',
      bestTimeToVisit: place.bestTimeToVisit || '',
      entryFee: place.entryFee || 'Free',
      timings: place.timings || 'Open daily',
      mapLink: place.mapLink || '',
      images:
        place.images && place.images.length > 0
          ? place.images.map((img) => ({
              url: img.url,
              caption: img.caption || '',
              isPrimary: Boolean(img.isPrimary),
            }))
          : [{ url: '', caption: '', isPrimary: true }],
    });
    setError('');
    setModalOpen(true);
  };

  // Image management helpers
  const handleAddImage = () => {
    setFormData({
      ...formData,
      images: [
        ...formData.images,
        { url: '', caption: '', isPrimary: formData.images.length === 0 },
      ],
    });
  };

  const handleRemoveImage = (index) => {
    const updated = formData.images.filter((_, i) => i !== index);
    // Ensure one image remains primary if any exist
    if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setFormData({ ...formData, images: updated });
  };

  const handleImageChange = (index, field, value) => {
    const updated = [...formData.images];
    updated[index][field] = value;
    setFormData({ ...formData, images: updated });
  };

  const handleSetPrimaryImage = (index) => {
    const updated = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    setFormData({ ...formData, images: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Filter out empty image rows
      const cleanImages = formData.images.filter((img) => img.url && img.url.trim());
      const payload = {
        ...formData,
        images: cleanImages,
        city: formData.city || null,
      };

      if (editingPlace) {
        await api.updatePlace(editingPlace._id, payload);
      } else {
        await api.createPlace(payload);
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
    if (!window.confirm(`Are you sure you want to permanently delete place "${name}"?`)) {
      return;
    }

    try {
      await api.deletePlace(id);
      loadData();
    } catch (err) {
      alert(err.message || 'Failed to delete place');
    }
  };

  // Filtered cities based on selected state in the form
  const availableCitiesForForm = cities.filter(
    (c) => (c.state?._id || c.state) === formData.state
  );

  const filteredPlaces = places.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.state?.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesState = stateFilter === 'All' || (p.state?._id || p.state?.slug) === stateFilter;
    return matchesSearch && matchesCat && matchesState;
  });

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
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Destination
          </button>
        </div>

        {/* Filters Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">Manage Tourist Places</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredPlaces.length} of {places.length} destinations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 outline-none w-full sm:w-auto"
            >
              <option value="All">All Categories</option>
              <option value="Heritage">Heritage</option>
              <option value="Nature">Nature</option>
              <option value="Adventure">Adventure</option>
              <option value="Religious">Religious</option>
            </select>

            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-medium bg-white text-slate-700 outline-none w-full sm:w-auto"
            >
              <option value="All">All States / UTs</option>
              {states.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.name}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search place name..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-saffron-500/20"
              />
            </div>
          </div>
        </div>

        {/* Places Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Place Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">State & City</th>
                  <th className="py-3 px-4">Entry Fee</th>
                  <th className="py-3 px-4">Images</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPlaces.map((p) => {
                  const primaryImg = p.images?.find((i) => i.isPrimary)?.url || p.images?.[0]?.url;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          {primaryImg && (
                            <img
                              src={primaryImg}
                              alt=""
                              className="w-9 h-9 rounded-lg object-cover shrink-0"
                            />
                          )}
                          <div>
                            <span>{p.name}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <CategoryBadge category={p.category} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">
                          {p.state?.name || '—'}
                        </span>
                        {p.city?.name && (
                          <span className="block text-[10px] text-slate-500">
                            {p.city.name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {p.entryFee || 'Free'}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-500">
                        {p.images?.length || 0} photos
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          href={`/places/${p.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-600 inline-block"
                          title="View Live Page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-600 hover:text-saffron-600 inline-block"
                          title="Edit Place"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 inline-block"
                          title="Delete Place"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal for Add / Edit */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-saffron-600" />
                  <h2 className="text-xl font-black text-slate-900">
                    {editingPlace ? `Edit "${editingPlace.name}"` : 'Add New Tourist Destination'}
                  </h2>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 text-xs">
                {/* 1. Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Place Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Taj Mahal"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-900 bg-white"
                    >
                      <option value="Heritage">Heritage</option>
                      <option value="Nature">Nature</option>
                      <option value="Adventure">Adventure</option>
                      <option value="Religious">Religious</option>
                    </select>
                  </div>
                </div>

                {/* 2. State & City References */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      State / UT *
                    </label>
                    <select
                      required
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value, city: '' })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-900 bg-white"
                    >
                      <option value="">Select State</option>
                      {states.map((st) => (
                        <option key={st._id} value={st._id}>
                          {st.name} ({st.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      City / Hub (Optional)
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-900 bg-white"
                    >
                      <option value="">None / Regional</option>
                      {availableCitiesForForm.map((ct) => (
                        <option key={ct._id} value={ct._id}>
                          {ct.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Description & Historical Significance */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description / Overview *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Comprehensive description of the destination, architecture, ambiance, and geography..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Historical & Cultural Significance
                  </label>
                  <textarea
                    rows={3}
                    value={formData.historicalSignificance}
                    onChange={(e) =>
                      setFormData({ ...formData, historicalSignificance: e.target.value })
                    }
                    placeholder="Historical chronicles, founding rulers, Vedic or architectural background..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-900"
                  />
                </div>

                {/* 4. Practical Travel Information */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Best Time to Visit
                    </label>
                    <input
                      type="text"
                      value={formData.bestTimeToVisit}
                      onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                      placeholder="e.g. October to March"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Entry Fee
                    </label>
                    <input
                      type="text"
                      value={formData.entryFee}
                      onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                      placeholder="e.g. ₹50 for Indians, Free"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Timings / Hours
                    </label>
                    <input
                      type="text"
                      value={formData.timings}
                      onChange={(e) => setFormData({ ...formData, timings: e.target.value })}
                      placeholder="e.g. 6:00 AM to 6:00 PM"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-900"
                    />
                  </div>
                </div>

                {/* 5. Map Link & Custom Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Google Maps Link
                    </label>
                    <input
                      type="url"
                      value={formData.mapLink}
                      onChange={(e) => setFormData({ ...formData, mapLink: e.target.value })}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-900"
                    />
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
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-saffron-500 text-slate-900 font-mono"
                    />
                  </div>
                </div>

                {/* 6. Image Gallery Manager */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 uppercase tracking-wider">
                        Image Gallery (URLs, Captions & Primary)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Add high resolution photo URLs. Designate one image as primary thumbnail.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddImage}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Add Photo
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                      >
                        {img.url ? (
                          <img
                            src={img.url}
                            alt=""
                            className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                            <ImageIcon className="w-5 h-5 text-slate-400" />
                          </div>
                        )}

                        <div className="flex-1 w-full space-y-2">
                          <input
                            type="url"
                            value={img.url}
                            onChange={(e) => handleImageChange(idx, 'url', e.target.value)}
                            placeholder="Image URL (https://...)"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-saffron-500 text-xs bg-white"
                          />
                          <input
                            type="text"
                            value={img.caption}
                            onChange={(e) => handleImageChange(idx, 'caption', e.target.value)}
                            placeholder="Photo Caption (e.g. Dawn reflection across marble pool)"
                            className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-saffron-500 text-xs bg-white"
                          />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(idx)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                              img.isPrimary
                                ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            <Star className={`w-3 h-3 ${img.isPrimary ? 'fill-slate-950' : ''}`} />
                            {img.isPrimary ? 'Primary' : 'Set Primary'}
                          </button>

                          {formData.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                              title="Remove Photo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
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
                    className="px-6 py-2.5 rounded-xl bg-saffron-600 hover:bg-saffron-700 text-white font-bold shadow-md"
                  >
                    {submitting ? 'Saving...' : editingPlace ? 'Update Destination' : 'Create Destination'}
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
