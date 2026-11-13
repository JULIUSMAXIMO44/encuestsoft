import { useId } from 'react';

// Vista de un campo tal como lo verá quien responde (solo lectura en el lienzo).
export default function FieldPreview({ field }) {
  const id = useId();
  const t = field.field_type;
  const opts = field.options_json || [];
  const ui = field.custom_attributes_json?.ui_kind;

  if (t === 'heading') return <h3 className="pv-heading">{field.label}</h3>;
  if (t === 'paragraph') return <p className="pv-paragraph">{field.label}</p>;
  if (t === 'divider') return <hr className="pv-divider" />;
  if (t === 'recaptcha') {
    return (
      <div className="pv-recaptcha">
        <span className="pv-box" aria-hidden="true" /> No soy un robot <small>reCAPTCHA</small>
      </div>
    );
  }
  if (t === 'hidden') {
    return <p className="pv-hidden">Campo oculto: «{field.field_key}» (no se muestra a quien responde)</p>;
  }

  let control;
  if (t === 'textarea') control = <textarea id={id} rows={3} placeholder={field.placeholder} disabled />;
  else if (t === 'select' || t === 'multiselect') {
    control = (
      <select id={id} disabled multiple={t === 'multiselect'} aria-label={field.label}>
        {opts.map((o) => (
          <option key={o.value}>{o.label}</option>
        ))}
      </select>
    );
  } else if (t === 'radio' || t === 'checkbox') {
    control = (
      <div className="pv-options">
        {opts.map((o) => (
          <label key={o.value}>
            <input type={t} disabled /> {o.label}
          </label>
        ))}
      </div>
    );
  } else if (t === 'rating') {
    control = (
      <div className="pv-stars" aria-hidden="true">
        {Array.from({ length: Number(field.max_value) || 5 }, (_, i) => (
          <span key={i}>★</span>
        ))}
      </div>
    );
  } else if (t === 'file' || t === 'image' || t === 'signature') {
    const text = t === 'signature' ? 'Firma aquí' : ui === 'camera' ? 'Tomar una foto' : ui === 'audio' ? 'Grabar mensaje de voz' : t === 'image' ? 'Seleccionar imagen' : 'Seleccionar archivo';
    control = <div className={`pv-drop${t === 'signature' ? ' is-signature' : ''}`}>{text}</div>;
  } else {
    const type = { email: 'email', number: 'number', password: 'password', date: 'date', time: 'time', datetime: 'datetime-local', phone: 'tel' }[t] || 'text';
    control = <input id={id} type={type} placeholder={field.placeholder} disabled />;
  }

  return (
    <div className="pv-field">
      <label htmlFor={id} className="pv-label">
        {field.label}
        {field.is_required && (
          <span className="pv-required" aria-hidden="true">
            {' '}*
          </span>
        )}
      </label>
      {control}
      {field.help_text && <p className="pv-help">{field.help_text}</p>}
    </div>
  );
}
