const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // sends httpOnly cookies across origins
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.message || 'Network request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Public
  getStates: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.type) qs.append('type', params.type);
    if (params.search) qs.append('search', params.search);
    if (params.activeOnly !== undefined) qs.append('activeOnly', params.activeOnly);
    return request(`/states?${qs.toString()}`);
  },
  getStateBySlug: (slug) => request(`/states/${slug}`),
  
  getCities: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.stateId) qs.append('stateId', params.stateId);
    if (params.stateSlug) qs.append('stateSlug', params.stateSlug);
    if (params.search) qs.append('search', params.search);
    return request(`/cities?${qs.toString()}`);
  },

  getPlaces: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.q) qs.append('q', params.q);
    if (params.state) qs.append('state', params.state);
    if (params.city) qs.append('city', params.city);
    if (params.category) qs.append('category', params.category);
    if (params.sort) qs.append('sort', params.sort);
    if (params.page) qs.append('page', params.page);
    if (params.limit) qs.append('limit', params.limit);
    return request(`/places?${qs.toString()}`);
  },
  getPlaceBySlug: (slug) => request(`/places/${slug}`),
  getCategories: () => request('/categories'),
  getStats: () => request('/stats'),

  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),

  // Admin State CRUD
  createState: (data) => request('/admin/states', { method: 'POST', body: data }),
  updateState: (id, data) => request(`/admin/states/${id}`, { method: 'PUT', body: data }),
  deleteState: (id) => request(`/admin/states/${id}`, { method: 'DELETE' }),

  // Admin City CRUD
  createCity: (data) => request('/admin/cities', { method: 'POST', body: data }),
  updateCity: (id, data) => request(`/admin/cities/${id}`, { method: 'PUT', body: data }),
  deleteCity: (id) => request(`/admin/cities/${id}`, { method: 'DELETE' }),

  // Admin Place CRUD
  createPlace: (data) => request('/admin/places', { method: 'POST', body: data }),
  updatePlace: (id, data) => request(`/admin/places/${id}`, { method: 'PUT', body: data }),
  deletePlace: (id) => request(`/admin/places/${id}`, { method: 'DELETE' }),
};
