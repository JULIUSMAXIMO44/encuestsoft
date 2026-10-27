import React from 'react';
import { Link } from 'react-router-dom';

import PublicNavbar from '../components/PublicNavbar.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import HelpModal from '../components/HelpModal.jsx';

/** Columnas del pie de página de la landing pública. */
const FOOTER_COLUMNS = [
  {
    title: 'Navegación',
    links: [
      { label: 'Inicio', to: '/' },
      { label: 'Funcionalidades', href: '#funcionalidades' },
      { label: 'Iniciar sesión', to: '/login' },
    ],
  },
  {
    title: 'Cuenta',
    links: [
      { label: 'Ingresar', to: '/login' },
      { label: 'Mi perfil', to: '/perfil' },
      { label: 'Configuración', to: '/configuracion' },
    ],
  },
  {
    title: 'Panel',
    links: [
      { label: 'Formularios', to: '/dashboard' },
      { label: 'Plantillas', to: '/dashboard' },
      { label: 'Compartidos', to: '/dashboard' },
    ],
  },
  {
    title: 'Soporte',
    links: [{ label: 'Accesibilidad', to: '/configuracion' }],
  },
];

/**
 * Home
 * ------------------------------------------------------------------
 * Página de inicio (landing) pública de EncuestSoft: carrusel de
 * bienvenida y tres tarjetas de funcionalidades destacadas.
 */
export default function Home() {
  return (
    <>
      <PublicNavbar variant="home" />

      <main className="page-main" id="main-content">
        <section className="hero-landing">
          <div className="container">
            <HeroCarousel />

            <div className="row feature-row g-4" id="funcionalidades">
              <div className="col-md-4">
                <div className="feature-card">
                  <i className="bi bi-clipboard2-check" aria-hidden="true"></i>
                  <h3>Crea encuestas en minutos</h3>
                  <p>
                    Diseña formularios de satisfacción a partir de plantillas o desde cero, con secciones y preguntas
                    configurables.
                  </p>
                  <Link to="/login" className="feature-link">
                    Ir a crear encuestas <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
              <div className="col-md-4">
                <div className="feature-card">
                  <i className="bi bi-send-check" aria-hidden="true"></i>
                  <h3>Envíos y seguimiento</h3>
                  <p>Comparte tus encuestas y lleva el control de cuántas veces se han enviado y respondido.</p>
                  <Link to="/login" className="feature-link">
                    Ver envíos <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
              <div className="col-md-4">
                <div className="feature-card">
                  <i className="bi bi-bar-chart-line" aria-hidden="true"></i>
                  <h3>Resultados centralizados</h3>
                  <p>Consulta formularios, plantillas y formularios compartidos desde un panel administrativo único.</p>
                  <Link to="/login" className="feature-link">
                    Ir al panel <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter columns={FOOTER_COLUMNS} />

      <button
        className="help-btn"
        id="helpBtn"
        aria-label="Ayuda"
        data-bs-toggle="modal"
        data-bs-target="#helpModal"
      >
        <i className="bi bi-question-lg" aria-hidden="true"></i>
      </button>

      <HelpModal />
    </>
  );
}
