/**
 * Cliente HTTP de EncuestSoft.
 * ------------------------------------------------------------------
 * - Envuelve fetch y desempaqueta el formato estándar del backend:
 *   `{ success, message, data, meta?, errors? }`.
 * - Adjunta el token JWT y, si la API responde 401, intenta renovarlo una
 *   sola vez con el refresh token antes de cerrar la sesión.
 * - Normaliza todos los errores en `ApiError` (mensaje legible para el usuario).
 */
import { API_URL } from '../config/env.js';

const TOKENS_KEY = 'encuestsoft_tokens';
export const SESSION_EXPIRED_EVENT = 'encuestsoft:session-expired';

/** Error de API con el detalle necesario para mostrarlo en la interfaz. */
export class ApiError extends Error {
  constructor(message, { status = 0, errors = [], code } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    /** Errores por campo: [{ field, message }] */
    this.errors = errors;
    this.code = code;
  }
}

/* ----------------------------- Manejo de tokens ----------------------------- */
export const tokenStore = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(TOKENS_KEY)) || null;
    } catch {
      return null;
    }
  },
  set(tokens) {
    localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  },
  clear() {
    localStorage.removeItem(TOKENS_KEY);
  },
};

let refreshPromise = null;

/** Renueva el access token. Si varias peticiones fallan a la vez, comparten una sola renovación. */
async function refreshAccessToken() {
  const tokens = tokenStore.get();
  if (!tokens?.refreshToken) throw new ApiError('Sesión expirada.', { status: 401 });
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) throw new ApiError('Sesión expirada.', { status: 401 });
        tokenStore.set({ ...tokens, ...json.data });
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

/** Construye la query string ignorando valores vacíos. */
function toQuery(params) {
  const q = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

/**
 * Ejecuta una petición contra la API.
 * @param {string} path  Ruta relativa al prefijo (ej. `/forms`).
 * @param {{method?: string, body?: any, params?: object, auth?: boolean, headers?: object, blob?: boolean}} options
 * @returns {Promise<{data: any, meta?: object, message?: string}>}
 */
export async function request(path, { method = 'GET', body, params, auth = true, headers = {}, blob = false } = {}, retried = false) {
  const finalHeaders = { ...headers };
  let payload;
  if (body instanceof FormData) {
    payload = body; // el navegador define el Content-Type con el boundary
  } else if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  if (auth) {
    const tokens = tokenStore.get();
    if (tokens?.accessToken) finalHeaders.Authorization = `Bearer ${tokens.accessToken}`;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}${toQuery(params)}`, { method, headers: finalHeaders, body: payload });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifique su conexión e inténtelo de nuevo.');
  }

  if (res.status === 401 && auth && !retried && tokenStore.get()?.refreshToken) {
    try {
      await refreshAccessToken();
      return request(path, { method, body, params, auth, headers, blob }, true);
    } catch {
      tokenStore.clear();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
      throw new ApiError('Su sesión expiró. Ingrese nuevamente.', { status: 401 });
    }
  }

  if (blob && res.ok) return { data: await res.blob(), headers: res.headers };

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    throw new ApiError(json.message || 'Ocurrió un error inesperado.', { status: res.status, errors: json.errors || [], code: json.code });
  }
  return { data: json.data, meta: json.meta, message: json.message };
}
