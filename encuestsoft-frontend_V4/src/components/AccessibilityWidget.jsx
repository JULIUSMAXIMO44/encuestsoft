import { useEffect, useId, useRef, useState } from 'react';
import { useAccessibility } from '../hooks/useAccessibility.js';
import { TEXT_SCALES } from '../context/AccessibilityContext.jsx';
import { AccessIcon } from './Icons.jsx';

const TOGGLES = [
  { key: 'contrast', label: 'Alto contraste' },
  { key: 'readable', label: 'Fuente legible' },
  { key: 'underline', label: 'Subrayar enlaces' },
  { key: 'spacing', label: 'Más espacio entre líneas y letras' },
  { key: 'reduceMotion', label: 'Reducir movimiento' },
];

// Botón flotante de usabilidad y accesibilidad. Se monta una sola vez en la
// raíz de la aplicación, por lo que está disponible en todas las pantallas.
export default function AccessibilityWidget() {
  const { settings, update, reset } = useAccessibility();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const titleId = useId();

  // Abrir desde otros puntos (p. ej. el enlace "Accesibilidad" del pie de página)
  useEffect(() => {
    const onClick = (e) => {
      if (e.target.closest?.('[data-open-a11y]')) setOpen(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  const idx = TEXT_SCALES.indexOf(settings.textScale);
  const setScale = (i) => update({ textScale: TEXT_SCALES[Math.min(TEXT_SCALES.length - 1, Math.max(0, i))] });

  return (
    <div className="a11y">
      {open && (
        <div
          ref={panelRef}
          className="a11y-panel"
          role="dialog"
          aria-labelledby={titleId}
          tabIndex="-1"
          onKeyDown={(e) => e.key === 'Escape' && close()}
        >
          <h2 id={titleId}>Usabilidad y accesibilidad</h2>
          <div className="a11y-row">
            <span>Tamaño del texto ({settings.textScale}%)</span>
            <div className="a11y-size">
              <button type="button" onClick={() => setScale(idx - 1)} disabled={idx <= 0} aria-label="Reducir texto">
                A−
              </button>
              <button type="button" onClick={() => setScale(TEXT_SCALES.indexOf(100))} aria-label="Tamaño normal">
                A
              </button>
              <button
                type="button"
                onClick={() => setScale(idx + 1)}
                disabled={idx >= TEXT_SCALES.length - 1}
                aria-label="Aumentar texto"
              >
                A+
              </button>
            </div>
          </div>
          {TOGGLES.map(({ key, label }) => (
            <label key={key} className="a11y-toggle">
              <input type="checkbox" checked={settings[key]} onChange={(e) => update({ [key]: e.target.checked })} />
              <span>{label}</span>
            </label>
          ))}
          <div className="a11y-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={reset}>
              Restablecer
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={close}>
              Cerrar
            </button>
          </div>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        className="a11y-button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-label="Opciones de usabilidad y accesibilidad"
      >
        <AccessIcon />
      </button>
    </div>
  );
}
