/**
 * FormRenderer
 * ------------------------------------------------------------------
 * Renderiza un formulario/encuesta a partir de su definición (schema del backend).
 * Se reutiliza en la página pública (/f/:uuid) y en la vista previa del constructor.
 *
 * Usabilidad y accesibilidad (WCAG 2.1 AA):
 *  - Cada control tiene <label> visible asociado; los grupos usan <fieldset>/<legend>.
 *  - Errores en línea (aria-invalid + aria-describedby) y resumen de errores enfocable.
 *  - Campos obligatorios indicados con texto y no solo con color.
 *  - Formularios por pasos con indicador de progreso y botones Anterior/Siguiente.
 *  - Campos condicionales que aparecen/desaparecen sin recargar.
 *  - Atributos `autocomplete` para agilizar el diligenciamiento.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isFieldVisible } from '../utils/conditionalLogic.js';
import { validateAll, validateField } from '../utils/validators.js';
import { normalizeOptions } from '../utils/fieldTypes.js';
import Recaptcha from './Recaptcha.jsx';

const WIDTH_CLASS = { full: 'col-12', half: 'col-12 col-md-6', third: 'col-12 col-md-4' };
const AUTOCOMPLETE = { email: 'email', phone: 'tel', date: 'bday' };

/** Campo individual (decorativo o de entrada). */
function FieldControl({ field, value, error, onChange, onBlur }) {
  const id = field.field_key;
  const helpId = `${id}-help`;
  const errId = `${id}-error`;
  const describedBy = [field.help_text && helpId, error && errId].filter(Boolean).join(' ') || undefined;
  const options = normalizeOptions(field.options_json);
  const common = {
    id,
    name: id,
    'aria-required': field.is_required || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    autoComplete: field.autocomplete_attr || field.a11y?.autoComplete || AUTOCOMPLETE[field.field_type] || 'off',
    onBlur,
  };
  const required = field.is_required && (
    <>
      <span aria-hidden="true" className="text-danger"> *</span>
      <span className="visually-hidden"> (obligatorio)</span>
    </>
  );

  // Elementos decorativos
  if (field.field_type === 'heading') return <h2 className="h4 mt-3">{field.label}</h2>;
  if (field.field_type === 'paragraph') return <p className="text-muted">{field.label}</p>;
  if (field.field_type === 'divider') return <hr />;

  let control;
  switch (field.field_type) {
    case 'textarea':
      control = <textarea {...common} className="form-control" rows={4} maxLength={field.max_length || undefined} placeholder={field.placeholder || ''} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />;
      break;
    case 'select':
      control = (
        <select {...common} className="form-select" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">{field.placeholder || 'Seleccione una opción'}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      );
      break;
    case 'radio':
    case 'rating': {
      const items = field.field_type === 'rating' ? [1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: String(n) })) : options;
      control = (
        <fieldset aria-describedby={describedBy} className={field.field_type === 'rating' ? 'd-flex gap-3 flex-wrap' : ''}>
          <legend className="form-label fs-6">{field.label}{required}</legend>
          {field.field_type === 'rating' && <span className="visually-hidden">Escala de 1 (más bajo) a 5 (más alto)</span>}
          {items.map((o) => (
            <div className="form-check" key={o.value}>
              <input className="form-check-input" type="radio" name={id} id={`${id}-${o.value}`} value={o.value} checked={String(value) === String(o.value)} aria-invalid={error ? true : undefined} onChange={() => onChange(o.value)} />
              <label className="form-check-label" htmlFor={`${id}-${o.value}`}>{o.label}</label>
            </div>
          ))}
        </fieldset>
      );
      break;
    }
    case 'checkbox':
    case 'multiselect': {
      const list = Array.isArray(value) ? value : [];
      control = (
        <fieldset aria-describedby={describedBy}>
          <legend className="form-label fs-6">{field.label}{required}</legend>
          {options.map((o) => (
            <div className="form-check" key={o.value}>
              <input className="form-check-input" type="checkbox" id={`${id}-${o.value}`} name={id} value={o.value} checked={list.includes(o.value)} aria-invalid={error ? true : undefined}
                onChange={() => onChange(list.includes(o.value) ? list.filter((x) => x !== o.value) : [...list, o.value])} />
              <label className="form-check-label" htmlFor={`${id}-${o.value}`}>{o.label}</label>
            </div>
          ))}
        </fieldset>
      );
      break;
    }
    case 'file':
    case 'image':
      control = <input {...common} type="file" className="form-control" multiple={(field.max_files || 1) > 1} accept={field.allowed_file_types || undefined} onChange={(e) => onChange(e.target.files)} />;
      break;
    default: {
      const typeMap = { phone: 'tel', datetime: 'datetime-local' };
      control = (
        <input {...common} type={typeMap[field.field_type] || field.field_type} className="form-control" placeholder={field.placeholder || ''}
          min={field.min_value ?? undefined} max={field.max_value ?? undefined} maxLength={field.max_length || undefined}
          inputMode={field.field_type === 'number' ? 'decimal' : undefined} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
      );
    }
  }

  const isGroup = ['radio', 'rating', 'checkbox', 'multiselect'].includes(field.field_type);
  return (
    <div className="mb-3">
      {!isGroup && <label htmlFor={id} className="form-label">{field.label}{required}</label>}
      {control}
      {field.help_text && <div id={helpId} className="form-text">{field.help_text}</div>}
      {field.field_type === 'file' && (
        <div className="form-text">Máximo {field.max_files || 1} archivo(s) de {field.max_file_size_mb || 10} MB.</div>
      )}
      {error && <div id={errId} className="text-danger small mt-1"><i className="bi bi-exclamation-circle me-1" aria-hidden="true"></i>{error}</div>}
    </div>
  );
}

/**
 * @param {object} props
 * @param {object} props.form  Esquema: { fields, is_multi_step, recaptcha_enabled, recaptcha_site_key, style_json }
 * @param {(answers: object, recaptchaToken?: string) => Promise<void>|void} props.onSubmit
 * @param {Array<{field:string,message:string}>} [props.serverErrors]
 * @param {object} [props.initialValues]
 * @param {boolean} [props.submitting]
 * @param {string} [props.submitLabel]
 */
export default function FormRenderer({ form, onSubmit, serverErrors = [], initialValues = {}, submitting = false, submitLabel = 'Enviar respuestas' }) {
  const fields = useMemo(() => [...(form.fields || [])].sort((a, b) => a.position - b.position), [form.fields]);
  const steps = useMemo(() => (form.is_multi_step ? [...new Set(fields.map((f) => f.step_number || 1))].sort((a, b) => a - b) : [1]), [fields, form.is_multi_step]);

  const [answers, setAnswers] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [stepIndex, setStepIndex] = useState(0);
  const [token, setToken] = useState('');
  const summaryRef = useRef(null);
  const currentStep = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  // Errores devueltos por el servidor (422) se muestran en cada campo.
  useEffect(() => {
    if (!serverErrors.length) return;
    setErrors((prev) => ({ ...prev, ...Object.fromEntries(serverErrors.map((e) => [e.field, e.message])) }));
    // Si el error está en otro paso, se vuelve a ese paso.
    const first = fields.find((f) => serverErrors.some((e) => e.field === f.field_key));
    if (first && form.is_multi_step) setStepIndex(Math.max(0, steps.indexOf(first.step_number || 1)));
    setTimeout(() => summaryRef.current?.focus(), 0);
  }, [serverErrors, fields, form.is_multi_step, steps]);

  const visibleFields = fields.filter((f) => (form.is_multi_step ? (f.step_number || 1) === currentStep : true) && isFieldVisible(f.conditional_logic_json, answers));
  const errorEntries = Object.entries(errors);

  const setValue = useCallback((key, value) => setAnswers((a) => ({ ...a, [key]: value })), []);

  /** Valida un campo al salir de él (retroalimentación inmediata). */
  const validateOne = (field) => {
    const msg = validateField(field, answers[field.field_key]);
    setErrors((e) => {
      const next = { ...e };
      if (msg) next[field.field_key] = msg; else delete next[field.field_key];
      return next;
    });
  };

  const failWith = (errs) => {
    setErrors(errs);
    setTimeout(() => summaryRef.current?.focus(), 0); // foco en el resumen para lectores de pantalla
  };

  function handleNext() {
    const errs = validateAll(fields, answers, currentStep);
    if (Object.keys(errs).length) return failWith(errs);
    setErrors({});
    setStepIndex((i) => i + 1);
    window.scrollTo({ top: 0 });
    return undefined;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isLast) return handleNext();
    const errs = validateAll(fields, answers);
    if (form.recaptcha_enabled && !token) errs.__recaptcha = 'Confirme la verificación de seguridad (reCAPTCHA).';
    if (Object.keys(errs).length) {
      // En formularios por pasos, regresa al primer paso con errores.
      const bad = fields.find((f) => errs[f.field_key]);
      if (bad && form.is_multi_step) setStepIndex(steps.indexOf(bad.step_number || 1));
      return failWith(errs);
    }
    setErrors({});
    // Solo se envían los campos visibles (igual que valida el backend).
    const payload = {};
    fields.forEach((f) => {
      if (['heading', 'paragraph', 'divider'].includes(f.field_type)) return;
      if (isFieldVisible(f.conditional_logic_json, answers) && answers[f.field_key] !== undefined) payload[f.field_key] = answers[f.field_key];
    });
    return onSubmit(payload, token);
  }

  const labelOf = (key) => fields.find((f) => f.field_key === key)?.label || 'Verificación';

  return (
    <form onSubmit={handleSubmit} noValidate aria-label={form.title}>
      {form.is_multi_step && steps.length > 1 && (
        <div className="mb-4" role="group" aria-label="Progreso del formulario">
          <p className="mb-1 fw-semibold" aria-live="polite">Paso {stepIndex + 1} de {steps.length}</p>
          <div className="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(((stepIndex + 1) / steps.length) * 100)} aria-label="Avance">
            <div className="progress-bar" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}></div>
          </div>
        </div>
      )}

      {errorEntries.length > 0 && (
        <div className="alert alert-danger" role="alert" tabIndex="-1" ref={summaryRef}>
          <p className="fw-bold mb-1">Revise {errorEntries.length === 1 ? 'el siguiente campo' : `los siguientes ${errorEntries.length} campos`}:</p>
          <ul className="mb-0">
            {errorEntries.map(([key, msg]) => (
              <li key={key}>{key === '__recaptcha' ? msg : <a href={`#${key}`} className="alert-link" onClick={(ev) => { ev.preventDefault(); document.getElementById(key)?.focus() ?? document.getElementById(`${key}-${normalizeOptions(fields.find((f) => f.field_key === key)?.options_json)[0]?.value}`)?.focus(); }}>{labelOf(key)}: {msg}</a>}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="small text-muted"><span aria-hidden="true" className="text-danger">*</span> Los campos marcados son obligatorios.</p>

      <div className="row">
        {visibleFields.map((f) => (
          <div key={f.field_key} className={WIDTH_CLASS[f.width] || 'col-12'}>
            <FieldControl field={f} value={answers[f.field_key]} error={errors[f.field_key]} onChange={(v) => setValue(f.field_key, v)} onBlur={() => validateOne(f)} />
          </div>
        ))}
      </div>

      {isLast && form.recaptcha_enabled && <Recaptcha siteKey={form.recaptcha_site_key} onToken={setToken} />}

      <div className="d-flex gap-2 flex-wrap mt-3">
        {stepIndex > 0 && (
          <button type="button" className="btn btn-outline-salir" onClick={() => { setStepIndex((i) => i - 1); window.scrollTo({ top: 0 }); }}>
            <i className="bi bi-arrow-left me-1" aria-hidden="true"></i>Anterior
          </button>
        )}
        <button type="submit" className="btn btn-agregar-secciones" disabled={submitting}>
          {submitting && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
          {isLast ? (submitting ? 'Enviando…' : submitLabel) : 'Siguiente'}
        </button>
      </div>
    </form>
  );
}
