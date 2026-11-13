import { request } from './api.js';

export const formsApi = {
  list: () => request('/forms'),
  get: (id) => request(`/forms/${id}`),
  create: ({ title, description }) => request('/forms', { method: 'POST', body: { title, description } }),
  update: (id, body) => request(`/forms/${id}`, { method: 'PATCH', body }),
  saveFields: (id, fields) => request(`/forms/${id}/fields`, { method: 'PUT', body: { fields } }),
  duplicate: (id) => request(`/forms/${id}/duplicate`, { method: 'POST' }),
  remove: (id) => request(`/forms/${id}`, { method: 'DELETE' }),
  setStatus: (id, status) => request(`/forms/${id}/status`, { method: 'PATCH', body: { status } }),
  setPassword: (id, password) => request(`/forms/${id}/password`, { method: 'PATCH', body: { password } }),
};
