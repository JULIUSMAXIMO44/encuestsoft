import React, { useState } from 'react';
import { useA11y } from '../context/A11yContext.jsx';

/**
 * AccessibilityWidget
 * ------------------------------------------------------------------
 * Botón flotante (borde derecho de la pantalla) que despliega un panel
 * con seis controles de accesibilidad: aumentar/disminuir letra, alto
 * contraste, tipografía para dislexia, lector de pantalla y paleta para
 * daltonismo, además de un botón para restablecer todo.
 *
 * Es un componente de presentación: toda la lógica vive en el hook
 * `useAccessibility`, este componente solo la conecta con la UI.
 */
export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { state, isReading, announcement, actions } = useA11y();

  function handleTogglePanel() {
    setIsOpen((prev) => !prev);
  }

  // Cierra el panel con la tecla Escape (paridad con el comportamiento
  // original) y devuelve el foco al botón que lo abrió.
  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div className="a11y-widget" onKeyDown={handleKeyDown}>
      <button
        type="button"
        className="a11y-toggle"
        id="a11yToggleBtn"
        aria-label="Abrir panel de accesibilidad"
        aria-expanded={isOpen}
        aria-controls="a11yPanel"
        onClick={handleTogglePanel}
      >
        <i className="bi bi-universal-access-circle" aria-hidden="true"></i>
      </button>

      <div className="a11y-panel" id="a11yPanel" role="region" aria-label="Panel de accesibilidad" hidden={!isOpen}>
        <div className="a11y-panel-icon" aria-hidden="true">
          🤝
        </div>
        <div className="a11y-grid">
          <button type="button" aria-label="Aumentar tamaño de letra" onClick={actions.increaseFont}>
            <span className="a11y-ico">A+</span>Aumentar Letra
          </button>
          <button type="button" aria-label="Disminuir tamaño de letra" onClick={actions.decreaseFont}>
            <span className="a11y-ico">A-</span>Disminuir Letra
          </button>
          <button
            type="button"
            aria-pressed={state.contrast}
            aria-label="Alternar alto contraste"
            className={state.contrast ? 'is-active' : ''}
            onClick={actions.toggleContrast}
          >
            <i className="bi bi-circle-half" aria-hidden="true"></i>Contraste
          </button>
          <button
            type="button"
            aria-pressed={state.dyslexia}
            aria-label="Alternar tipografía para dislexia"
            className={state.dyslexia ? 'is-active' : ''}
            onClick={actions.toggleDyslexia}
          >
            <i className="bi bi-book" aria-hidden="true"></i>Dislexia
          </button>
          <button
            type="button"
            aria-pressed={isReading}
            aria-label="Leer el contenido de la página en voz alta"
            className={isReading ? 'is-active' : ''}
            onClick={actions.toggleReader}
          >
            <i className="bi bi-ear" aria-hidden="true"></i>Lector
          </button>
          <button
            type="button"
            aria-pressed={state.daltonismo}
            aria-label="Alternar paleta segura para daltonismo"
            className={state.daltonismo ? 'is-active' : ''}
            onClick={actions.toggleDaltonismo}
          >
            <i className="bi bi-eye" aria-hidden="true"></i>Daltonismo
          </button>
        </div>
        <button type="button" className="a11y-reset" aria-label="Restablecer accesibilidad" onClick={actions.reset}>
          <i className="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
        </button>
      </div>

      {/* Región "aria-live": anuncia a lectores de pantalla cada cambio. */}
      <div className="a11y-sr-status" role="status" aria-live="polite">
        {announcement}
      </div>
    </div>
  );
}
