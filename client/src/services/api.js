/**
 * API Service Client for INVOXA
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('invoxa_token') || localStorage.getItem('invoiceflow_token');

  const headers = {
    ...options.headers,
  };

  // If body is not FormData, set Content-Type to JSON
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 && !endpoint.includes('/auth/login')) {
        localStorage.removeItem('invoxa_token');
        localStorage.removeItem('invoxa_user');
        localStorage.removeItem('invoiceflow_token');
        localStorage.removeItem('invoiceflow_user');
        window.location.href = '/login';
      }
      throw new Error(data.message || data.error || 'Request failed');
    }

    return data;
  } catch (err) {
    throw err;
  }
};

export const api = {
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  post: (endpoint, body) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (endpoint, body) =>
    apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  patch: (endpoint, body = {}) =>
    apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};

export default api;
