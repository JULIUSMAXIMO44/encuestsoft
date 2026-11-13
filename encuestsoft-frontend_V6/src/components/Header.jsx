import { Link, useLocation } from 'react-router-dom';
import { HomeIcon } from './Icons.jsx';

// Barra de navegación amarilla fina, igual en todas las pantallas públicas.
export default function Header() {
  const { pathname } = useLocation();
  const onLogin = pathname === '/ingresar';
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="topbar-brand" aria-label="EncuestSoft, ir al inicio">
          <img src="/img/logo-es.png" alt="" width="28" height="28" />
          <span>EncuestSoft</span>
        </Link>
        <nav aria-label="Principal" className="topbar-nav">
          <Link to="/" className="topbar-link">
            <HomeIcon width={15} height={15} /> Inicio
          </Link>
          {!onLogin && (
            <Link to="/ingresar" className="btn btn-primary btn-sm">
              Ingresar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
