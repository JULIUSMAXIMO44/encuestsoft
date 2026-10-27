import React, { useId, useRef, useState } from 'react';
import { Modal } from 'bootstrap';

/**
 * RecuperarModal
 * ------------------------------------------------------------------
 * Solicita la recuperación de contraseña. NOTA: el backend actual no expone aún un
 * endpoint de recuperación (ver README → "Pendientes del backend"); mientras tanto
 * se valida el correo y se muestra el mensaje genérico definido en el diseño.
 * Cuando exista el endpoint, basta con llamarlo dentro de `handleSend`.
 *
 * @param {{ onSend: () => void }} props
 */
export default function RecuperarModal({ onSend }) {
  const inputId = useId();
  const modalRef = useRef(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function handleSend(event) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Ingrese un correo válido, por ejemplo nombre@dominio.com.');
      return;
    }
    setError('');
    Modal.getInstance(modalRef.current)?.hide();
    setEmail('');
    onSend();
  }

  return (
    <div className="modal fade" id="recuperarModal" tabIndex="-1" aria-hidden="true" aria-labelledby="recuperarModalLabel" ref={modalRef}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="recuperarModalLabel">Recuperar contraseña</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <form onSubmit={handleSend} noValidate>
            <div className="modal-body">
              <label htmlFor={inputId} className="form-label">Correo registrado</label>
              <input
                type="email"
                className={`form-control${error ? ' is-invalid' : ''}`}
                id={inputId}
                placeholder="tucorreo@ejemplo.com"
                autoComplete="email"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${inputId}-err` : undefined}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {error && <div className="invalid-feedback d-block" id={`${inputId}-err`}>{error}</div>}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-salir" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" className="btn btn-agregar-secciones">Enviar enlace</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
