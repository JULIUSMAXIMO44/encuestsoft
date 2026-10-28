import React, { useState } from 'react';
import { formsApi } from '../../services/api.js';
import { useUi } from '../../context/UiContext.jsx';
import { toLocalInput } from '../../utils/format.js';

/** Relación de contraste WCAG entre dos colores hex. */
function contrastRatio(a, b) {
  const lum = (hex) => {
    const n = parseInt(hex.replace('#', ''), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
      .map((v) => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; })
      .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
  };
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const toIso = (local) => (local ? new Date(local).toISOString() : null);

/**
 * Pestaña de configuración general del formulario (PATCH /forms/:id).
 * @param {{ form: object, onSaved: (form: object) => void }} props
 */
export default function FormSettings({ form, onSaved }) {
  const { notify } = useUi();
  const style = form.style_json || {};
  const [v, setV] = useState({
    title: form.title || '',
    description: form.description || '',
    success_message: form.success_message || '',
    error_message: form.error_message || '',
    redirect_url: form.redirect_url || '',
    redirect_delay_seconds: form.redirect_delay_seconds || 0,
    opens_at: toLocalInput(form.opens_at),
    closes_at: toLocalInput(form.closes_at),
    is_multi_step: !!form.is_multi_step,
    allow_multiple_submissions: form.allow_multiple_submissions !== false,
    submission_limit: form.submission_limit ?? '',
    allow_prefill_from_url: form.allow_prefill_from_url !== false,
    recaptcha_enabled: !!form.recaptcha_enabled,
    notify_email_enabled: form.notify_email_enabled !== false,
    notify_emails: form.notify_emails || '',
    submission_pdf_enabled: !!form.submission_pdf_enabled,
    textColor: style.textColor || '#222222',
    backgroundColor: style.backgroundColor || '#ffffff',
  });
  const [errors, setErrors] = useState({});
  const [warnings, setWarnings] = useState([]);
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const ratio = contrastRatio(v.textColor, v.backgroundColor);

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = {};
    if (!v.title.trim()) errs.title = 'El título es obligatorio.';
    if (v.redirect_url && !/^https?:\/\//i.test(v.redirect_url)) errs.redirect_url = 'Use una URL completa que empiece por http:// o https://';
    if (v.opens_at && v.closes_at && v.closes_at < v.opens_at) errs.closes_at = 'El cierre debe ser posterior a la apertura.';
    setErrors(errs);
    if (Object.keys(errs).length) { document.getElementById(`s-${Object.keys(errs)[0]}`)?.focus(); return; }
    setSaving(true);
    try {
      const { form: saved, warnings: w } = await formsApi.update(form.id, {
        title: v.title.trim(), description: v.description, success_message: v.success_message, error_message: v.error_message,
        redirect_url: v.redirect_url || null, redirect_delay_seconds: Number(v.redirect_delay_seconds) || 0,
        opens_at: toIso(v.opens_at), closes_at: toIso(v.closes_at),
        is_multi_step: v.is_multi_step, allow_multiple_submissions: v.allow_multiple_submissions,
        submission_limit: v.submission_limit === '' ? null : Number(v.submission_limit),
        allow_prefill_from_url: v.allow_prefill_from_url, recaptcha_enabled: v.recaptcha_enabled,
        notify_email_enabled: v.notify_email_enabled, notify_emails: v.notify_emails, submission_pdf_enabled: v.submission_pdf_enabled,
        style_json: { ...style, textColor: v.textColor, backgroundColor: v.backgroundColor },
      });
      setWarnings(w);
      onSaved(saved);
      notify('Configuración guardada.');
    } catch (err) {
      notify(err.message);
    } finally {
      setSaving(false);
    }
  }

  const text = (k, label, props = {}, hint) => (
    <div className="mb-3">
      <label htmlFor={`s-${k}`} className="form-label">{label}</label>
      {props.as === 'textarea'
        ? <textarea id={`s-${k}`} className="form-control" rows={3} value={v[k]} onChange={set(k)} />
        : <input id={`s-${k}`} className={`form-control${errors[k] ? ' is-invalid' : ''}`} value={v[k]} onChange={set(k)} aria-invalid={errors[k] ? true : undefined} aria-describedby={errors[k] ? `s-${k}-err` : undefined} {...props} />}
      {hint && <div className="form-text">{hint}</div>}
      {errors[k] && <div className="invalid-feedback d-block" id={`s-${k}-err`}>{errors[k]}</div>}
    </div>
  );
  const sw = (k, label, hint) => (
    <div className="form-check form-switch mb-3">
      <input className="form-check-input" type="checkbox" role="switch" id={`s-${k}`} checked={v[k]} onChange={set(k)} aria-describedby={hint ? `s-${k}-h` : undefined} />
      <label className="form-check-label" htmlFor={`s-${k}`}>{label}</label>
      {hint && <div className="form-text" id={`s-${k}-h`}>{hint}</div>}
    </div>
  );

  return (
    <form className="content-card" onSubmit={handleSubmit} noValidate>
      <fieldset className="mb-4"><legend className="h5">General</legend>
        {text('title', 'Título', { maxLength: 200, required: true })}
        {text('description', 'Descripción', { as: 'textarea' })}
      </fieldset>

      <fieldset className="mb-4"><legend className="h5">Disponibilidad</legend>
        <div className="row g-3">
          <div className="col-md-6">{text('opens_at', 'Abre el', { type: 'datetime-local' })}</div>
          <div className="col-md-6">{text('closes_at', 'Cierra el', { type: 'datetime-local' })}</div>
        </div>
        {text('submission_limit', 'Límite de respuestas', { type: 'number', min: 1 }, 'Déjelo vacío para no limitar.')}
        {sw('allow_multiple_submissions', 'Permitir más de una respuesta por persona')}
        {sw('allow_prefill_from_url', 'Permitir pre-llenar campos desde la URL', 'Ej.: /f/<id>?correo=ana@udec.edu.co')}
      </fieldset>

      <fieldset className="mb-4"><legend className="h5">Experiencia del encuestado</legend>
        {sw('is_multi_step', 'Dividir el formulario en pasos', 'Asigne el paso de cada campo en sus propiedades.')}
        {text('success_message', 'Mensaje al enviar', { as: 'textarea' })}
        {text('error_message', 'Mensaje de error general', { as: 'textarea' })}
        {text('redirect_url', 'Redirigir a otra página después de enviar', { type: 'url', placeholder: 'https://…' })}
        {text('redirect_delay_seconds', 'Segundos antes de redirigir', { type: 'number', min: 0 })}
      </fieldset>

      <fieldset className="mb-4"><legend className="h5">Seguridad y notificaciones</legend>
        {sw('recaptcha_enabled', 'Proteger con reCAPTCHA (antispam)')}
        {sw('notify_email_enabled', 'Notificar por correo cada nueva respuesta')}
        {v.notify_email_enabled && text('notify_emails', 'Correos a notificar', {}, 'Separe varios correos con coma.')}
        {sw('submission_pdf_enabled', 'Generar PDF de cada respuesta')}
      </fieldset>

      <fieldset className="mb-4"><legend className="h5">Apariencia</legend>
        <div className="row g-3 align-items-end">
          <div className="col-6 col-md-3"><label htmlFor="s-textColor" className="form-label">Color del texto</label><input id="s-textColor" type="color" className="form-control form-control-color" value={v.textColor} onChange={set('textColor')} /></div>
          <div className="col-6 col-md-3"><label htmlFor="s-backgroundColor" className="form-label">Color de fondo</label><input id="s-backgroundColor" type="color" className="form-control form-control-color" value={v.backgroundColor} onChange={set('backgroundColor')} /></div>
          <div className="col-md-6" aria-live="polite">
            <div className="p-2 rounded border" style={{ color: v.textColor, background: v.backgroundColor }}>Vista de muestra del texto</div>
            <p className={`small mb-0 mt-1 ${ratio >= 4.5 ? 'text-success' : 'text-danger'}`}>
              <i className={`bi ${ratio >= 4.5 ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-1`} aria-hidden="true"></i>
              Contraste {ratio.toFixed(1)}:1 — {ratio >= 4.5 ? 'cumple WCAG AA' : 'insuficiente (mínimo 4.5:1)'}
            </p>
          </div>
        </div>
        {warnings.map((w) => <div key={w} className="alert alert-warning mt-3 py-2" role="alert">{w}</div>)}
      </fieldset>

      <button type="submit" className="btn btn-agregar-secciones" disabled={saving}>
        {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}Guardar configuración
      </button>
    </form>
  );
}
