import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Toast as BsToast } from 'bootstrap';

/**
 * AppToast
 * ------------------------------------------------------------------
 * Notificación flotante (esquina inferior derecha) reutilizable en
 * cualquier página. El componente padre obtiene una referencia y llama
 * a `ref.current.show('mensaje')` para mostrarla; toda la mecánica de
 * Bootstrap (temporizador, animación) queda encapsulada aquí.
 *
 * @param {{ id: string, title?: string }} props
 */
const AppToast = forwardRef(function AppToast({ id, title = 'EncuestSoft' }, ref) {
  const toastElRef = useRef(null);
  const bodyRef = useRef(null);

  useImperativeHandle(ref, () => ({
    show(message) {
      if (bodyRef.current) bodyRef.current.textContent = message;
      if (toastElRef.current) {
        const instance = BsToast.getOrCreateInstance(toastElRef.current, { delay: 3500 });
        instance.show();
      }
    },
  }));

  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3">
      <div id={id} className="toast" role="status" aria-live="polite" aria-atomic="true" ref={toastElRef}>
        <div className="toast-header">
          <strong className="me-auto">{title}</strong>
          <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Cerrar"></button>
        </div>
        <div className="toast-body" ref={bodyRef}></div>
      </div>
    </div>
  );
});

export default AppToast;
