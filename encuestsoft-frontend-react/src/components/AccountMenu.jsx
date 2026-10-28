import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LABELS } from '../utils/format.js';

/** Chip de rol + menú desplegable de usuario (perfil, configuración, cerrar sesión). */
export default function AccountMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = user?.full_name || 'Usuario';

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <>
      <li className="nav-item mb-2 mb-lg-0">
        <span className="role-chip"><i className="bi bi-person-badge" aria-hidden="true"></i> {ROLE_LABELS[user?.role] || user?.role}</span>
      </li>
      <li className="nav-item dropdown mb-2 mb-lg-0">
        <button type="button" className="nav-link dropdown-toggle user-chip btn btn-link" data-bs-toggle="dropdown" aria-expanded="false" aria-label={`Menú de ${name}`}>
          <span className="avatar-dot" aria-hidden="true">{name.charAt(0).toUpperCase()}</span> {name.split(' ')[0]}
        </button>
        <ul className="dropdown-menu dropdown-menu-end">
          <li><Link className="dropdown-item" to="/perfil"><i className="bi bi-person me-2" aria-hidden="true"></i>Mi perfil</Link></li>
          <li><Link className="dropdown-item" to="/configuracion"><i className="bi bi-gear me-2" aria-hidden="true"></i>Configuración</Link></li>
          <li><hr className="dropdown-divider" /></li>
          <li><button type="button" className="dropdown-item" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2" aria-hidden="true"></i>Cerrar sesión</button></li>
        </ul>
      </li>
    </>
  );
}
