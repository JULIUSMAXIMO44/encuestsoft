import React from 'react';
import { Link } from 'react-router-dom';
import AccountMenu from './AccountMenu.jsx';

/**
 * DashboardNav
 * ------------------------------------------------------------------
 * Barra de navegación dorada del panel principal: incluye el buscador
 * de encuestas (controlado desde <Dashboard>), el chip de rol, el menú
 * desplegable de usuario y el botón de notificaciones.
 *
 * @param {{ searchTerm: string, onSearchChange: (value: string) => void }} props
 */
export default function DashboardNav({ searchTerm, onSearchChange }) {
  return (
    <nav className="navbar navbar-expand-lg app-shell-nav" aria-label="Navegación del panel">
      <div className="container-fluid px-3 px-lg-4">
        <Link className="navbar-brand brand-group" to="/dashboard" aria-label="EncuestSoft — Ir al inicio">
          <img src="/images/es-badge-gold.svg" alt="" width="36" height="36" />
          <span className="brand-text" style={{ fontSize: '.95rem' }}>
            ENCUESTSOFT <small style={{ display: 'inline' }}>U DE C</small>
          </span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navDash"
          aria-controls="navDash"
          aria-expanded="false"
          aria-label="Abrir menú de navegación"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navDash">
          <Link to="/" className="pill-btn ms-lg-2 mb-2 mb-lg-0">
            <i className="bi bi-house-door" aria-hidden="true"></i> Inicio
          </Link>

          <form
            className="ms-lg-3 mb-2 mb-lg-0 search-box flex-grow-1"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="tableSearch" className="visually-hidden">
              Buscar encuestas
            </label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-search" aria-hidden="true"></i>
              </span>
              <input
                type="search"
                id="tableSearch"
                className="form-control"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(event) => onSearchChange(event.target.value)}
              />
            </div>
          </form>

          <ul className="navbar-nav ms-lg-auto align-items-lg-center gap-lg-3">
            <AccountMenu />
            <li className="nav-item">
              <button className="bell-btn" aria-label="Notificaciones" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="bi bi-bell" aria-hidden="true"></i>
                <span className="bell-dot" aria-hidden="true"></span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <span className="dropdown-item-text small text-muted">No tienes notificaciones nuevas.</span>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
