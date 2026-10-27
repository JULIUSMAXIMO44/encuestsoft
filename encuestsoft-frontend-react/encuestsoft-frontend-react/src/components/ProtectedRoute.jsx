import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Protege rutas privadas. Mientras se restaura la sesión muestra un indicador de carga
 * accesible; si no hay sesión redirige a /login recordando la ruta solicitada.
 * `roles` restringe además por rol (owner, admin, editor, viewer).
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="page-main d-flex justify-content-center align-items-center" id="main-content">
        <div className="spinner-border" role="status"><span className="visually-hidden">Cargando sesión…</span></div>
      </main>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}
