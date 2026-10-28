import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import FormRenderer from '../components/FormRenderer.jsx';
import PublicNavbar from '../components/PublicNavbar.jsx';
import SimpleFooter from '../components/SimpleFooter.jsx';
import { publicApi } from '../services/api.js';
import { ApiError } from '../services/http.js';

/** Construye el FormData del envío: archivos, arreglos (valores repetidos) y token reCAPTCHA. */
function buildFormData(answers, recaptchaToken) {
  const fd = new FormData();
  Object.entries(answers).forEach(([key, value]) => {
    if (value instanceof FileList) Array.from(value).forEach((f) => fd.append(key, f));
    else if (Array.isArray(value)) value.forEach((v) => fd.append(key, v));
    else if (value !== undefined && value !== null) fd.append(key, value);
  });
  if (recaptchaToken) fd.append('recaptcha_token', recaptchaToken);
  return fd;
}

/** Lee valores de la URL (?campo=valor) para pre-llenar el formulario si el backend lo permite. */
function readPrefill(form) {
  const params = new URLSearchParams(window.location.search);
  const values = {};
  (form.fields || []).forEach((f) => {
    const all = params.getAll(f.field_key);
    if (all.length) values[f.field_key] = ['checkbox', 'multiselect'].includes(f.field_type) ? all : all[0];
  });
  return values;
}

/**
 * Página pública de respuesta (/f/:uuid). No requiere sesión.
 * Estados: cargando → (contraseña) → formulario → enviado | error.
 */
export default function PublicForm() {
  const { uuid } = useParams();
  const [view, setView] = useState('loading'); // loading | password | ready | error | done
  const [form, setForm] = useState(null);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [prefill, setPrefill] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState([]);
  const [result, setResult] = useState(null);
  const headingRef = useRef(null);

  const load = useCallback(async (pwd) => {
    setView('loading');
    try {
      const data = await publicApi.getForm(uuid, pwd);
      setForm(data);
      setPrefill(data.allow_prefill_from_url ? readPrefill(data) : {});
      setView('ready');
    } catch (err) {
      if (err instanceof ApiError && err.code === 'PASSWORD_REQUIRED') {
        setMessage(pwd ? 'La contraseña no es correcta. Inténtelo de nuevo.' : '');
        setView('password');
      } else {
        setMessage(err.message);
        setView('error');
      }
    }
  }, [uuid]);

  useEffect(() => { load(''); }, [load]);

  // Redirección opcional tras el envío (solo http/https).
  useEffect(() => {
    if (view !== 'done' || !result?.redirect_url || !/^https?:\/\//i.test(result.redirect_url)) return undefined;
    const t = setTimeout(() => { window.location.href = result.redirect_url; }, (result.redirect_delay_seconds || 3) * 1000);
    return () => clearTimeout(t);
  }, [view, result]);

  // Al terminar, mueve el foco al mensaje de confirmación.
  useEffect(() => { if (view === 'done') headingRef.current?.focus(); }, [view]);

  async function handleSubmit(answers, recaptchaToken) {
    setSubmitting(true);
    setServerErrors([]);
    setMessage('');
    try {
      const data = await publicApi.submit(uuid, buildFormData(answers, recaptchaToken), password);
      setResult(data);
      setView('done');
    } catch (err) {
      if (err.status === 422 && err.errors?.length) setServerErrors(err.errors);
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const style = form?.style_json || {};
  const cssVars = { '--bs-body-color': style.textColor, background: style.backgroundColor };

  return (
    <>
      <PublicNavbar variant="login" />
      <main className="page-main container" id="main-content" style={{ maxWidth: 820 }}>
        {view === 'loading' && (
          <div className="text-center py-5" role="status"><div className="spinner-border" aria-hidden="true"></div><p className="mt-2">Cargando formulario…</p></div>
        )}

        {view === 'error' && (
          <div className="content-card text-center my-4">
            <i className="bi bi-exclamation-triangle fs-1" aria-hidden="true"></i>
            <h1 className="h3 mt-2">Formulario no disponible</h1>
            <p>{message}</p>
          </div>
        )}

        {view === 'password' && (
          <form className="content-card my-4" onSubmit={(e) => { e.preventDefault(); load(password); }}>
            <h1 className="h3">Este formulario está protegido</h1>
            <p className="text-muted">Ingrese la contraseña que le compartieron para continuar.</p>
            {message && <div className="alert alert-danger py-2" role="alert">{message}</div>}
            <label htmlFor="form-password" className="form-label">Contraseña del formulario</label>
            <input id="form-password" type="password" className="form-control mb-3" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required />
            <button className="btn btn-agregar-secciones">Continuar</button>
          </form>
        )}

        {view === 'ready' && form && (
          <article className="content-card my-4" style={cssVars}>
            <h1 className="h2">{form.title}</h1>
            {form.description && <p className="lead">{form.description}</p>}
            {message && !serverErrors.length && <div className="alert alert-danger" role="alert">{form.error_message || message}</div>}
            <FormRenderer form={form} initialValues={prefill} onSubmit={handleSubmit} serverErrors={serverErrors} submitting={submitting} />
          </article>
        )}

        {view === 'done' && (
          <div className="content-card text-center my-4" role="status">
            <i className="bi bi-check-circle-fill text-success fs-1" aria-hidden="true"></i>
            <h1 className="h3 mt-2" tabIndex="-1" ref={headingRef}>¡Gracias por responder!</h1>
            <p>{result?.message}</p>
            {result?.reference_id && <p>Su número de referencia es <strong>{result.reference_id}</strong>. Consérvelo por si necesita consultarlo.</p>}
            {result?.redirect_url && <p className="small text-muted">Será redirigido en unos segundos…</p>}
          </div>
        )}
      </main>
      <SimpleFooter />
    </>
  );
}
