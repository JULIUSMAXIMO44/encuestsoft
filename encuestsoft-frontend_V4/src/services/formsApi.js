import { request } from './api.js';

export const formsApi = {
  list: () => request('/forms'),
  create: ({ title, description }) => request('/forms', { method: 'POST', body: { title, description } }),
  duplicate: (id) => request(`/forms/${id}/duplicate`, { method: 'POST' }),
  remove: (id) => request(`/forms/${id}`, { method: 'DELETE' }),
  setStatus: (id, status) => request(`/forms/${id}/status`, { method: 'PATCH', body: { status } }),
};
