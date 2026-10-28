import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from 'bootstrap';
import { useAuth } from '../context/AuthContext.jsx';

const EMPTY = { organization_name: '', full_name: '', email: '', password: '', confirm: '' };

/** Valida el formulario de registro; devuelve errores por campo. */
function validate(v) {
  const e = {};
  if (!v.organization_name.trim()) e.organization_name = 'Escriba el nombre de su organización o dependencia.';
  if (!v.full_name.trim()) e.full_name = 'Escriba su nombre completo.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) e.email = 'Ingrese un correo válido.';
  if (v.password.length < 8) e.password = 'La contraseña debe tener al menos 8 caracteres.';
  if (v.confirm !== v.password) e.confirm = 'Las contraseñas no coinciden.';
  return e;
}

/**
 * RegistroModal
 * ------------------------------------------------------------------
 * Crea la cuenta (organización + usuario propietario) con POST /auth/register
 * e inicia sesión automáticamente.
 */
export default function RegistroModal() {
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const { register } = useAuth();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`reg-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setLoading(true);
    try {
      await register({ organization_name: values.organization_name.trim(), full_name: values.full_name.trim(), email: values.email.trim(), password: values.password });
      Modal.getInstance(modalRef.current)?.hide();
      setValues(EMPTY);
      navigate('/dashboard');
    } catch (err) {
      // El backend devuelve errores por campo en 422; se muestran junto al control.
      if (err.errors?.length) setErrors(Object.fromEntries(err.errors.map((x) => [x.field, x.message])));
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const field = (key, label, type = 'text', autoComplete = 'off', hint) => (
    <div className="mb-3">
      <label className="form-label" htmlFor={`reg-${key}`}>{label}</label>
      <input
        id={`reg-${key}`}
        type={type}
        className={`form-control${errors[key] ? ' is-invalid' : ''}`}
        value={values[key]}
        onChange={set(key)}
        autoComplete={autoComplete}
        aria-invalid={errors[key] ? true : undefined}
        aria-describedby={[hint && `reg-${key}-hint`, errors[key] && `reg-${key}-err`].filter(Boolean).join(' ') || undefined}
        required
      />
      {hint && <div className="form-text" id={`reg-${key}-hint`}>{hint}</div>}
      {errors[key] && <div className="invalid-feedback d-block" id={`reg-${key}-err`}>{errors[key]}</div>}
    </div>
  );

  return (
    <div className="modal fade" id="registroModal" tabIndex="-1" aria-hidden="true" aria-labelledby="registroModalLabel" ref={modalRef}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="registroModalLabel">Crear una cuenta</h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="modal-body">
              {apiError && <div className="alert alert-danger py-2 small" role="alert">{apiError}</div>}
              {field('organization_name', 'Organización o dependencia', 'text', 'organization')}
              {field('full_name', 'Nombre completo', 'text', 'name')}
              {field('email', 'Correo electrónico', 'email', 'email')}
              {field('password', 'Contraseña', 'password', 'new-password', 'Mínimo 8 caracteres.')}
              {field('confirm', 'Confirmar contraseña', 'password', 'new-password')}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-salir" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" className="btn btn-agregar-secciones" disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
                Crear cuenta
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
