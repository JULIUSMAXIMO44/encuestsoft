import React from 'react';

/**
 * HelpModal
 * ------------------------------------------------------------------
 * Modal informativo de ayuda, invocado desde el botón flotante de
 * "?" en la esquina inferior izquierda de la página de inicio.
 */
export default function HelpModal() {
  return (
    <div className="modal fade" id="helpModal" tabIndex="-1" aria-hidden="true" aria-labelledby="helpModalLabel">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="helpModalLabel">
              ¿Necesitas ayuda?
            </h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div className="modal-body text-center">
            <p className="mb-0">
              Escríbenos al Centro de Inserción Laboral y Responsabilidad Social de la Universidad de Cartagena para
              soporte sobre EncuestSoft.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
