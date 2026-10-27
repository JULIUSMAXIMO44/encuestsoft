import React, { useRef, useState } from 'react';
import { Modal } from 'bootstrap';

/**
 * NuevaEncuestaModal
 * ------------------------------------------------------------------
 * Formulario modal para crear una encuesta (título, descripción, fecha de inicio y cierre).
 * Valida con mensajes específicos por campo y delega la creación asíncrona en `onCreate`
 * (a cargo de <Dashboard>, que habla con la API).
 *
 * @param {{ onCreate: (data: {titulo:string, descripcion:string, fechaInicio:string, fechaCierre:string}) => Promise<void> }} props
 */
const EMPTY = { titulo: '', descripcion: '', fechaInicio: '', fechaCierre: '' };

export default function NuevaEncuestaModal({ onCreate }) {
  const modalRef = useRef(null);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setApiError('');
  }

  function validate() {
    const e = {};
    if (!values.titulo.trim()) e.titulo = 'Escriba el título de la encuesta.';
    if (!values.descripcion.trim()) e.descripcion = 'Escriba una descripción breve.';
    if (!values.fechaInicio) e.fechaInicio = 'Seleccione la fecha de inicio.';
    if (!values.fechaCierre) e.fechaCierre = 'Seleccione la fecha de cierre.';
    else if (values.fechaInicio && values.fechaCierre < values.fechaInicio) e.fechaCierre = 'El cierre debe ser igual o posterior al inicio.';
    return e;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = { titulo: 'tituloEncuesta', descripcion: 'descEncuesta', fechaInicio: 'fechaInicio', fechaCierre: 'fechaCierre' }[Object.keys(e)[0]];
      document.getElementById(first)?.focus();
      return;
    }
    setLoading(true);
    setApiError('');
    try {
      await onCreate({ ...values, titulo: values.titulo.trim(), descripcion: values.descripcion.trim() });
      Modal.getInstance(modalRef.current)?.hide();
      reset();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const input = (key, id, label, type = 'text', placeholder) => (
    <>
      <label className="form-label" htmlFor={id}>{label}</label>
      <input
        type={type}
        className={`form-control${errors[key] ? ' is-invalid' : ''}`}
        id={id}
        placeholder={placeholder}
        value={values[key]}
        onChange={set(key)}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={errors[key] ? `${id}-err` : undefined}
        required
      />
      {errors[key] && <div className="invalid-feedback d-block" id={`${id}-err`}>{errors[key]}</div>}
    </>
  );

  return (
    <div className="modal fade" id="nuevaEncuestaModal" tabIndex="-1" aria-hidden="true" aria-labelledby="nuevaEncuestaModalLabel" ref={modalRef}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="nuevaEncuestaModalLabel">Crear Nueva Encuesta</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar" onClick={reset}></button>
          </div>
          <form id="nuevaEncuestaForm" noValidate onSubmit={handleSubmit}>
            <div className="modal-body">
              {apiError && <div className="alert alert-danger py-2 small" role="alert">{apiError}</div>}
              <div className="mb-3">{input('titulo', 'tituloEncuesta', 'Título', 'text', 'Escriba el título...')}</div>
              <div className="mb-3">{input('descripcion', 'descEncuesta', 'Descripción', 'text', 'Escriba una descripción breve...')}</div>
              <div className="row g-3">
                <div className="col-sm-6">{input('fechaInicio', 'fechaInicio', 'Fecha de inicio', 'date')}</div>
                <div className="col-sm-6">{input('fechaCierre', 'fechaCierre', 'Cierre', 'date')}</div>
              </div>
              <p className="form-text mt-3 mb-0">Después podrá agregar las preguntas con el constructor.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-salir" data-bs-dismiss="modal" onClick={reset}>Salir</button>
              <button type="submit" className="btn btn-agregar-secciones" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
                Agregar Secciones
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
