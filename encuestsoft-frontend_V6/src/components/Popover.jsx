import { useEffect, useId, useRef, useState } from 'react';

// Botón + panel desplegable (patrón de "divulgación"): se cierra con Esc,
// con clic fuera o al perder el foco, y devuelve el foco al botón.
export default function Popover({ label, button, className = '', align = 'right', children }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const btnRef = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div
      className="popover"
      ref={wrapRef}
      onBlur={(e) => {
        if (open && !wrapRef.current?.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={btnRef}
        type="button"
        className={className}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
      >
        {button}
      </button>
      {open && (
        <div id={panelId} className={`popover-panel align-${align}`} role="region" aria-label={label}>
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  );
}
