import { useEffect, useId, useRef, useState } from 'react';
import { useAccessibility } from '../hooks/useAccessibility.js';
import { TEXT_SCALES } from '../context/AccessibilityContext.jsx';
import {
  AccessIcon,
  BookOpenIcon,
  ContrastIcon,
  EarIcon,
  EyeIcon,
  LinkIcon,
  MotionIcon,
  ResetIcon,
  SpacingIcon,
  TypeIcon,
} from './Icons.jsx';

// Opciones de activar/desactivar. Las seis primeras del modelo visual
// (A+, A-, Contraste, Dislexia, Lector, Daltonismo) y las ya existentes.
const TOGGLES = [
  { key: 'contrast', label: 'Contraste', Icon: ContrastIcon },
  { key: 'dyslexia', label: 'Dislexia', Icon: BookOpenIcon },
  { key: 'reader', label: 'Lector', Icon: EarIcon },
  { key: 'colorblind', label: 'Daltonismo', Icon: EyeIcon },
  { key: 'readable', label: 'Fuente legible', Icon: TypeIcon },
  { key: 'underline', label: 'Subrayar enlaces', Icon: LinkIcon },
  { key: 'spacing', label: 'Más espacio', Icon: SpacingIcon, hint: 'entre líneas y letras' },
  { key: 'reduceMotion', label: 'Reducir movimiento', Icon: MotionIcon },
];

// Botón flotante de usabilidad y accesibilidad. Se monta una sola vez en la
// raíz de la aplicación, por lo que está disponible en todas las pantallas.
export default function AccessibilityWidget() {
  const { settings, update, reset } = useAccessibility();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const titleId = useId();
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Abrir desde otros puntos de la plataforma
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
          <h2 id={titleId} className="a11y-title">
            <span aria-hidden="true" className="a11y-hand">🤝</span>
            <span className="sr-only">Usabilidad y accesibilidad</span>
          </h2>
          <div className="a11y-grid">
            <button type="button" className="a11y-tile" onClick={() => setScale(idx + 1)} disabled={idx >= TEXT_SCALES.length - 1}>
              <span className="a11y-glyph" aria-hidden="true">A+</span>
              <span>Aumentar Letra</span>
              <small>{settings.textScale}%</small>
            </button>
            <button type="button" className="a11y-tile" onClick={() => setScale(idx - 1)} disabled={idx <= 0}>
              <span className="a11y-glyph" aria-hidden="true">A-</span>
              <span>Disminuir Letra</span>
              <small>{settings.textScale}%</small>
            </button>
            {TOGGLES.map(({ key, label, Icon, hint }) => {
              const unavailable = key === 'reader' && !canSpeak;
              return (
                <button
                  key={key}
                  type="button"
                  className={`a11y-tile${settings[key] ? ' is-on' : ''}`}
                  aria-pressed={settings[key]}
                  disabled={unavailable}
                  onClick={() => update({ [key]: !settings[key] })}
                >
                  <Icon width={24} height={24} aria-hidden="true" />
                  <span>{label}</span>
                  {hint && <small>{hint}</small>}
                  {unavailable && <small>No disponible en este navegador</small>}
                </button>
              );
            })}
          </div>
          <button type="button" className="a11y-reset" onClick={reset} aria-label="Restablecer opciones de accesibilidad" title="Restablecer">
            <ResetIcon width={24} height={24} />
          </button>
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
