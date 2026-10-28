/**
 * Servicios de la API de EncuestSoft, agrupados por recurso.
 * Cada función devuelve directamente `data` (y `meta` cuando aplica).
 * Referencia: backend `docs/API.md`.
 */
import { request, tokenStore } from './http.js';

export const authApi = {
  async login(email, password) {
    const { data } = await request('/auth/login', { method: 'POST', body: { email, password }, auth: false });
    tokenStore.set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  },
  async register(payload) {
    const { data } = await request('/auth/register', { method: 'POST', body: payload, auth: false });
    tokenStore.set({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data;
  },
  me: () => request('/auth/me').then((r) => r.data),
  updateAccessibility: (prefs) => request('/auth/me/accessibility', { method: 'PATCH', body: prefs }).then((r) => r.data),
  logout: () => tokenStore.clear(),
};

export const formsApi = {
  list: () => request('/forms').then((r) => r.data),
  get: (id) => request(`/forms/${id}`).then((r) => r.data),
  create: (body) => request('/forms', { method: 'POST', body }).then((r) => r.data),
  update: (id, body) => request(`/forms/${id}`, { method: 'PATCH', body }).then((r) => ({ form: r.data, warnings: r.meta?.accessibility_warnings || [] })),
  remove: (id) => request(`/forms/${id}`, { method: 'DELETE' }),
  duplicate: (id) => request(`/forms/${id}/duplicate`, { method: 'POST' }).then((r) => r.data),
  setStatus: (id, status) => request(`/forms/${id}/status`, { method: 'PATCH', body: { status } }).then((r) => r.data),
  setPassword: (id, password) => request(`/forms/${id}/password`, { method: 'PATCH', body: { password } }).then((r) => r.data),
  saveFields: (id, fields) => request(`/forms/${id}/fields`, { method: 'PUT', body: { fields } }).then((r) => r.data),
  embed: (id) => request(`/forms/${id}/embed`).then((r) => r.data),
};

export const publicApi = {
  getForm: (uuid, password) =>
    request(`/public/forms/${uuid}`, { auth: false, headers: password ? { 'x-form-password': password } : {} }).then((r) => r.data),
  submit: (uuid, formData, password) =>
    request(`/public/forms/${uuid}/submit`, { method: 'POST', body: formData, auth: false, headers: password ? { 'x-form-password': password } : {} }).then((r) => r.data),
};

export const submissionsApi = {
  list: (formId, params) => request(`/forms/${formId}/submissions`, { params }).then((r) => ({ items: r.data, meta: r.meta })),
  remove: (formId, id) => request(`/forms/${formId}/submissions/${id}`, { method: 'DELETE' }),
  /** Descarga un archivo autenticado (exportación o PDF) y lo guarda en el equipo del usuario. */
  async download(path, params, filename) {
    const { data } = await request(path, { params, blob: true });
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
  exportAll(formId, format, slug = 'respuestas') {
    return submissionsApi.download(`/forms/${formId}/submissions/export`, { format }, `${slug}.${format}`);
  },
  pdf(formId, id, name) {
    return submissionsApi.download(`/forms/${formId}/submissions/${id}/pdf`, undefined, `${name}.pdf`);
  },
};

export const reportsApi = {
  general: (formId, params) => request(`/forms/${formId}/reports/general`, { params }).then((r) => r.data),
  fields: (formId) => request(`/forms/${formId}/reports/fields`).then((r) => r.data),
};
