import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * SimpleAppNav
 * ------------------------------------------------------------------
 * Barra de navegación dorada usada en las páginas internas secundarias
 * (Mi perfil, Configuración), con únicamente los enlaces "Volver al
 * panel" e "Inicio".
 */
export default function SimpleAppNav() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg app-shell-nav" aria-label="Navegación del panel">
      <div className="container-fluid px-3 px-lg-4">
        <Link className="navbar-brand brand-group" to="/" aria-label="EncuestSoft — Ir al inicio">
          <img src="/images/es-badge-gold.svg" alt="" width="36" height="36" />
          <span className="brand-text" style={{ fontSize: '.95rem' }}>
            ENCUESTSOFT <small style={{ display: 'inline' }}>U DE C</small>
          </span>
        </Link>
        <div className="nav-links">
          <Link to="/dashboard">
            <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>Volver al panel
          </Link>
          <Link to="/">
            <i className="bi bi-house-door me-1" aria-hidden="true"></i>Inicio
          </Link>
          <button type="button" className="btn btn-link nav-logout" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-1" aria-hidden="true"></i>Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}
