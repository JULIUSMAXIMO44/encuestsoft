import { useEffect, useId, useRef, useState } from 'react';

// Botón "?" de ayuda, abajo a la izquierda, disponible en todas las pantallas.
// Por ahora muestra consejos de uso; Help & Support completo llega en la fase 9.
export default function HelpButton() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const buttonRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  const close = () => {
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div className="help">
      {open && (
        <div
          ref={panelRef}
          className="help-panel"
          role="dialog"
          aria-labelledby={titleId}
          tabIndex="-1"
          onKeyDown={(e) => e.key === 'Escape' && close()}
        >
          <h2 id={titleId}>Ayuda rápida</h2>
          <ul>
            <li>Con el teclado: Tab para avanzar, Mayús+Tab para retroceder, Enter para activar.</li>
            <li>En el carrusel: flechas izquierda y derecha cambian de diapositiva.</li>
            <li>El botón azul de la derecha ajusta tamaño de texto, contraste y movimiento.</li>
          </ul>
          <button type="button" className="btn btn-outline btn-sm" onClick={close}>
            Cerrar
          </button>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        className="help-button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-label="Ayuda"
      >
        ?
      </button>
    </div>
  );
}
