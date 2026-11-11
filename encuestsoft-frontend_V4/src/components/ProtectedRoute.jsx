import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

// Solo deja pasar con sesión válida. Sin sesión, envía a /ingresar (sin guardar
// el panel en el historial) para que no se pueda volver sin autenticarse.
export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="screen-center" role="status" aria-live="polite">
        Verificando tu sesión…
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/ingresar" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
