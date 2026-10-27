import React from 'react';
import { Link } from 'react-router-dom';

import SimpleAppNav from '../components/SimpleAppNav.jsx';
import SimpleFooter from '../components/SimpleFooter.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LABELS, formatDateTime } from '../utils/format.js';

/**
 * Perfil
 * ------------------------------------------------------------------
 * Muestra los datos reales del usuario en sesión (GET /auth/me): nombre, correo,
 * rol, organización y plan contratado.
 */
export default function Perfil() {
  const { user, organization } = useAuth();
  const rows = [
    ['Nombre completo', user.full_name],
    ['Correo electrónico', user.email],
    ['Rol', ROLE_LABELS[user.role] || user.role],
    ['Organización', organization?.name || '—'],
    ['Plan', organization?.Plan?.name || organization?.Plan?.code || '—'],
    ['Último ingreso', formatDateTime(user.last_login_at)],
  ];

  return (
    <>
      <SimpleAppNav />

      <main className="container page-main" id="main-content">
        <div className="simple-page-header">
          <p className="breadcrumb-nav"><Link to="/">Inicio</Link> / <Link to="/dashboard">Panel</Link> / Mi perfil</p>
          <h1>Mi perfil</h1>
        </div>

        <div className="content-card">
          <div className="d-flex align-items-center gap-3 mb-4">
            <span className="avatar-dot" style={{ width: 56, height: 56, fontSize: '1.3rem' }} aria-hidden="true">{user.full_name.charAt(0).toUpperCase()}</span>
            <div>
              <p className="fw-bold mb-0" style={{ fontSize: '1.1rem' }}>{user.full_name}</p>
              <p className="text-muted mb-0 small">{ROLE_LABELS[user.role]} · {organization?.name || 'EncuestSoft U de C'}</p>
            </div>
          </div>

          <h2>Información de la cuenta</h2>
          <dl className="mb-0">
            {rows.map(([label, value]) => (
              <div className="settings-row" key={label}>
                <div>
                  <dt className="label">{label}</dt>
                  <dd className="desc mb-0">{value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="mt-4 d-flex gap-2 flex-wrap">
            <Link to="/configuracion" className="btn btn-outline-salir">Ir a configuración</Link>
            <Link to="/dashboard" className="btn btn-agregar-secciones">Volver al panel</Link>
          </div>
        </div>
      </main>

      <SimpleFooter />
    </>
  );
}
