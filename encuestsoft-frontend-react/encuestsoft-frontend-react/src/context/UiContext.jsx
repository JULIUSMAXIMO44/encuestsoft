/**
 * Contexto de interfaz: notificaciones (toast) y confirmaciones accesibles.
 * ------------------------------------------------------------------
 * - `notify(mensaje)`: muestra un toast con `aria-live` (lo anuncian los lectores de pantalla).
 * - `confirm({...})`: reemplaza `window.confirm` por un modal de Bootstrap con foco
 *   gestionado; devuelve una promesa booleana. Evita confirmaciones nativas poco accesibles.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Modal } from 'bootstrap';
import AppToast from '../components/AppToast.jsx';

const UiContext = createContext(null);

export function UiProvider({ children }) {
  const toastRef = useRef(null);
  const modalRef = useRef(null);
  const resolverRef = useRef(null);
  const [dialog, setDialog] = useState(null);

  const notify = useCallback((message) => toastRef.current?.show(message), []);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        resolverRef.current = resolve;
        setDialog(options);
      }),
    [],
  );

  // Abre el modal cuando hay una confirmación pendiente.
  useEffect(() => {
    if (!dialog || !modalRef.current) return undefined;
    const el = modalRef.current;
    const instance = Modal.getOrCreateInstance(el);
    const onHidden = () => {
      resolverRef.current?.(false); // cierre sin confirmar (Esc, cruz, clic fuera)
      resolverRef.current = null;
      setDialog(null);
    };
    el.addEventListener('hidden.bs.modal', onHidden, { once: true });
    instance.show();
    return () => el.removeEventListener('hidden.bs.modal', onHidden);
  }, [dialog]);

  function answer(value) {
    resolverRef.current?.(value);
    resolverRef.current = null;
    Modal.getInstance(modalRef.current)?.hide();
  }

  const value = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  return (
    <UiContext.Provider value={value}>
      {children}

      <div className="modal fade" tabIndex="-1" aria-labelledby="confirmTitle" aria-hidden="true" ref={modalRef}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title h5" id="confirmTitle">{dialog?.title || 'Confirmar acción'}</h2>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">{dialog?.message}</div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-salir" onClick={() => answer(false)}>
                Cancelar
              </button>
              <button type="button" className={dialog?.danger ? 'btn btn-danger' : 'btn btn-agregar-secciones'} onClick={() => answer(true)}>
                {dialog?.confirmLabel || 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AppToast id="appToast" ref={toastRef} />
    </UiContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useUi = () => useContext(UiContext);
