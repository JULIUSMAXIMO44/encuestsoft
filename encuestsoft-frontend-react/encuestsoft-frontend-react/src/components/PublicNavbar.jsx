import React from 'react';
import { Link } from 'react-router-dom';

/**
 * PublicNavbar
 * ------------------------------------------------------------------
 * Barra de navegación blanca usada en las páginas públicas (Inicio y
 * Login). En Inicio muestra el menú completo (Inicio / Funcionalidades /
 * Panel) más el botón "Ingresar"; en Login solo muestra el enlace de
 * regreso a Inicio, igual que en el prototipo original.
 *
 * @param {{ variant?: 'home' | 'login' }} props
 */
export default function PublicNavbar({ variant = 'home' }) {
  return (
    <nav className="navbar app-navbar" aria-label="Navegación principal">
      <div className="container d-flex justify-content-between align-items-center flex-wrap gap-2">
        <Link to="/" className="brand-group" aria-label="EncuestSoft — Ir al inicio">
          <img src="/images/es-badge-outline.svg" alt="" width="34" height="34" />
          {variant === 'home' ? (
            <span className="brand-text">
              EncuestSoft <span className="sep">-</span> Bienvenido al Sistema Manejador de Encuestas en línea
            </span>
          ) : (
            <span className="brand-text">EncuestSoft</span>
          )}
        </Link>

        {variant === 'home' ? (
          <div className="d-flex align-items-center gap-3">
            <div className="nav-links d-none d-md-flex">
              <Link to="/" className="active">
                Inicio
              </Link>
              <a href="#funcionalidades">Funcionalidades</a>
              <Link to="/login">Panel</Link>
            </div>
            <Link to="/login" className="btn btn-ingresar">
              Ingresar
            </Link>
          </div>
        ) : (
          <div className="nav-links">
            <Link to="/">
              <i className="bi bi-house-door me-1" aria-hidden="true"></i>Inicio
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
