import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

// Marcador de la fase 2 (dashboard y cabecera completos).
export default function Dashboard() {
  const { user, organization, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-inner">
          <span className="topbar-brand">
            <img src="/img/logo-es.png" alt="" width="28" height="28" />
            <span>EncuestSoft</span>
          </span>
          <nav aria-label="Principal" className="topbar-nav">
            <button type="button" className="btn btn-outline btn-sm" onClick={onLogout}>
              Cerrar sesión
            </button>
          </nav>
        </div>
      </header>
      <main id="contenido" tabIndex="-1" className="dashboard-placeholder">
        <h1>Hola, {user?.full_name || 'bienvenido'}</h1>
        {organization?.name && <p>Organización: {organization.name}</p>}
        <p>El dashboard con la tabla de encuestas se construye en la fase 2.</p>
      </main>
    </div>
  );
}
