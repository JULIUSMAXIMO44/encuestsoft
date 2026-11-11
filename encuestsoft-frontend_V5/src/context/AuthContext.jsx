import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authApi, tokenStore, setSessionExpiredHandler } from '../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true); // restaurando sesión

  const clearSession = useCallback(() => {
    tokenStore.clear();
    setUser(null);
    setOrganization(null);
  }, []);

  const applySession = useCallback((data) => {
    tokenStore.setAccess(data.accessToken);
    tokenStore.setRefresh(data.refreshToken);
    setUser(data.user);
    setOrganization(data.organization || null);
  }, []);

  // Restaurar sesión al cargar la página (si hay refresh token en esta pestaña)
  useEffect(() => {
    let active = true;
    (async () => {
      if (!tokenStore.getRefresh()) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authApi.me();
        if (active) {
          setUser(data.user || data);
          setOrganization(data.organization || null);
        }
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [clearSession]);

  // Si el refresh falla en cualquier petición, se cierra la sesión local
  useEffect(() => {
    setSessionExpiredHandler(clearSession);
  }, [clearSession]);

  // Al volver con el botón "Atrás" desde caché, se revalida la sesión
  useEffect(() => {
    const onPageShow = (e) => {
      if (e.persisted && !tokenStore.getAccess()) window.location.reload();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const login = useCallback(
    async (email, password) => {
      const { data } = await authApi.login(email, password);
      applySession(data);
    },
    [applySession]
  );

  const register = useCallback(
    async (form) => {
      const { data } = await authApi.register(form);
      applySession(data);
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout(); // el servidor invalida el token (pendiente en backend, fase 1)
    } catch {
      /* aunque falle, la sesión local se cierra siempre */
    }
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, organization, loading, isAuthenticated: Boolean(user), login, register, logout }),
    [user, organization, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
