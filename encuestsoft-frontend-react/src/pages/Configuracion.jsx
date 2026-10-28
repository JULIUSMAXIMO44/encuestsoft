import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import SimpleAppNav from '../components/SimpleAppNav.jsx';
import SimpleFooter from '../components/SimpleFooter.jsx';
import { useA11y } from '../context/A11yContext.jsx';

/**
 * Configuracion
 * ------------------------------------------------------------------
 * Página de configuración: resume las opciones de accesibilidad
 * (los controles reales viven en el widget flotante, disponible en
 * cualquier página) y agrupa las preferencias generales del usuario.
 */
export default function Configuracion() {
  const { state, actions } = useA11y();
  const [emailNotifications, setEmailNotifications] = useState(true);

  /** Fila con interruptor accesible para una preferencia. */
  const rows = [
    { id: 'a11y-contrast', label: 'Alto contraste', desc: 'Aplica una combinación de colores de alto contraste para mejorar la legibilidad.', checked: state.contrast, onChange: actions.toggleContrast },
    { id: 'a11y-dyslexia', label: 'Tipografía para dislexia', desc: 'Cambia la fuente y el espaciado del texto para facilitar la lectura.', checked: state.dyslexia, onChange: actions.toggleDyslexia },
    { id: 'a11y-dalt', label: 'Paleta para daltonismo', desc: 'Sustituye los colores del sistema por una paleta segura para daltonismo.', checked: state.daltonismo, onChange: actions.toggleDaltonismo },
    { id: 'a11y-motion', label: 'Reducir movimiento', desc: 'Desactiva animaciones y transiciones.', checked: state.reducedMotion, onChange: actions.toggleReducedMotion },
  ];

  return (
    <>
      <SimpleAppNav />

      <main className="container page-main" id="main-content">
        <div className="simple-page-header">
          <p className="breadcrumb-nav">
            <Link to="/">Inicio</Link> / <Link to="/dashboard">Panel</Link> / Configuración
          </p>
          <h1>Configuración</h1>
        </div>

        <div className="content-card mb-4" id="accesibilidad">
          <h2>
            <i className="bi bi-universal-access-circle me-2" aria-hidden="true"></i>
            Accesibilidad
          </h2>
          <p className="text-muted">
            Estas opciones también están disponibles en cualquier página desde el botón de accesibilidad ubicado en el
            borde derecho de la pantalla.
          </p>
          <div className="settings-row">
            <div>
              <div className="label" id="font-label">Tamaño de letra: {Math.round(state.scale * 100)}%</div>
              <div className="desc">Aumenta o disminuye el texto en todo el sitio.</div>
            </div>
            <div className="btn-group" role="group" aria-labelledby="font-label">
              <button type="button" className="btn btn-outline-salir" onClick={actions.decreaseFont} aria-label="Disminuir tamaño de letra">A−</button>
              <button type="button" className="btn btn-outline-salir" onClick={actions.increaseFont} aria-label="Aumentar tamaño de letra">A+</button>
            </div>
          </div>
          {rows.map((row) => (
            <div className="settings-row" key={row.id}>
              <div>
                <label className="label" htmlFor={row.id}>{row.label}</label>
                <div className="desc" id={`${row.id}-d`}>{row.desc}</div>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" role="switch" id={row.id} aria-describedby={`${row.id}-d`} checked={row.checked} onChange={row.onChange} />
              </div>
            </div>
          ))}
          <p className="small text-muted mt-3 mb-0">Sus preferencias se guardan en su cuenta y se aplican en cualquier dispositivo.</p>
        </div>

        <div className="content-card">
          <h2>Preferencias generales</h2>
          <div className="settings-row">
            <div>
              <div className="label">Idioma</div>
              <div className="desc">Español (Colombia)</div>
            </div>
          </div>
          <div className="settings-row">
            <div>
              <div className="label">Notificaciones por correo</div>
              <div className="desc">Recibir un correo cuando una encuesta reciba nuevas respuestas.</div>
            </div>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="notifSwitch"
                checked={emailNotifications}
                onChange={(event) => setEmailNotifications(event.target.checked)}
              />
              <label className="form-check-label visually-hidden" htmlFor="notifSwitch">
                Activar notificaciones por correo
              </label>
            </div>
          </div>
        </div>
      </main>

      <SimpleFooter />
    </>
  );
}
