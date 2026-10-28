/**
 * Contexto de autenticación.
 * ------------------------------------------------------------------
 * Mantiene el usuario y la organización en sesión. Al montar, si hay un token
 * guardado, consulta `/auth/me` para restaurar la sesión tras recargar la página.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../services/api.js';
import { SESSION_EXPIRED_EVENT, tokenStore } from '../services/http.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  // `loading` evita redirigir a /login mientras se restaura la sesión.
  const [loading, setLoading] = useState(() => !!tokenStore.get());

  const applySession = useCallback((data) => {
    setUser(data.user);
    setOrganization(data.organization || null);
  }, []);

  const clearSession = useCallback(() => {
    authApi.logout();
    setUser(null);
    setOrganization(null);
  }, []);

  // Restaurar sesión al cargar la aplicación.
  useEffect(() => {
    if (!tokenStore.get()) return;
    authApi
      .me()
      .then(applySession)
      .catch(clearSession)
      .finally(() => setLoading(false));
  }, [applySession, clearSession]);

  // Si el refresh token falla en cualquier petición, se cierra la sesión.
  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, clearSession);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, clearSession);
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      organization,
      loading,
      isAuthenticated: !!user,
      async login(email, password) {
        const data = await authApi.login(email, password);
        applySession(data);
        return data;
      },
      async register(payload) {
        const data = await authApi.register(payload);
        applySession(data);
        return data;
      },
      logout: clearSession,
      /** Actualiza localmente datos del usuario (p. ej. preferencias de accesibilidad). */
      patchUser: (changes) => setUser((u) => (u ? { ...u, ...changes } : u)),
    }),
    [user, organization, loading, applySession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Acceso al contexto de autenticación. */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
