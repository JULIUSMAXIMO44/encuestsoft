// Cliente HTTP del backend de ENCUESTSOFT.
// El access token vive solo en memoria; el refresh token en sessionStorage
// (se borra al cerrar la pestaña y al cerrar sesión).
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
const REFRESH_KEY = 'encuestsoft.refresh';

let accessToken = null;
let onSessionExpired = () => {};

export const tokenStore = {
  getAccess: () => accessToken,
  setAccess: (t) => {
    accessToken = t;
  },
  getRefresh: () => {
    try {
      return sessionStorage.getItem(REFRESH_KEY);
    } catch {
      return null;
    }
  },
  setRefresh: (t) => {
    try {
      if (t) sessionStorage.setItem(REFRESH_KEY, t);
      else sessionStorage.removeItem(REFRESH_KEY);
    } catch {
      /* sin almacenamiento disponible */
    }
  },
  clear() {
    accessToken = null;
    this.setRefresh(null);
  },
};

export function setSessionExpiredHandler(fn) {
  onSessionExpired = fn;
}

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors || [];
  }
}

async function rawRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.', 0);
  }
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    /* respuesta sin cuerpo */
  }
  if (!res.ok) {
    throw new ApiError(payload?.message || 'Ocurrió un error inesperado.', res.status, payload?.errors);
  }
  return payload;
}

let refreshing = null;
async function refreshAccessToken() {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new ApiError('Sesión expirada.', 401);
  if (!refreshing) {
    refreshing = rawRequest('/auth/refresh', { method: 'POST', body: { refreshToken }, auth: false })
      .then(({ data }) => {
        tokenStore.setAccess(data.accessToken);
        if (data.refreshToken) tokenStore.setRefresh(data.refreshToken);
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export async function request(path, options = {}) {
  try {
    return await rawRequest(path, options);
  } catch (err) {
    if (err.status === 401 && options.auth !== false && tokenStore.getRefresh()) {
      try {
        await refreshAccessToken();
        return await rawRequest(path, options);
      } catch {
        tokenStore.clear();
        onSessionExpired();
        throw new ApiError('Tu sesión expiró. Inicia sesión de nuevo.', 401);
      }
    }
    throw err;
  }
}

export const authApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (data) => request('/auth/register', { method: 'POST', body: data, auth: false }),
  me: () => request('/auth/me'),
  logout: () => request('/auth/logout', { method: 'POST', body: { refreshToken: tokenStore.getRefresh() } }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),
};
