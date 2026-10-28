import React, { forwardRef } from 'react';
import { OPTION_TYPES, getFieldType, normalizeOptions } from '../../utils/fieldTypes.js';

const OPERATORS = [
  ['equals', 'es igual a'], ['not_equals', 'es distinto de'], ['contains', 'contiene'], ['not_contains', 'no contiene'],
  ['greater_than', 'es mayor que'], ['less_than', 'es menor que'], ['is_empty', 'está vacío'], ['is_not_empty', 'no está vacío'],
];

/** Fila de formulario con etiqueta asociada. */
function Row({ id, label, hint, children }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label mb-1">{label}</label>
      {children}
      {hint && <div className="form-text">{hint}</div>}
    </div>
  );
}

/**
 * Panel de propiedades del campo seleccionado.
 * @param {{ field: object, allFields: object[], isMultiStep: boolean, keyError?: string, onChange: (changes: object) => void }} props
 */
const FieldProperties = forwardRef(function FieldProperties({ field, allFields, isMultiStep, keyError, onChange }, labelRef) {
  if (!field) {
    return (
      <section className="builder-panel" aria-labelledby="props-title">
        <h2 className="h6" id="props-title">Propiedades</h2>
        <p className="text-muted small mb-0">Seleccione un campo del formulario para editar sus propiedades.</p>
      </section>
    );
  }

  const t = getFieldType(field.field_type);
  const set = (key) => (e) => onChange({ [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const isDecorative = t.decorative;
  const hasOptions = OPTION_TYPES.includes(field.field_type);
  const isText = ['text', 'textarea', 'email', 'phone'].includes(field.field_type);
  const isNumeric = ['number', 'rating'].includes(field.field_type);
  const isFile = field.field_type === 'file';
  const others = allFields.filter((f) => f._cid !== field._cid && !getFieldType(f.field_type).decorative);
  const logic = field.conditional_logic_json || { action: 'show', logic: 'all', rules: [] };
  const setLogic = (changes) => onChange({ conditional_logic_json: { ...logic, ...changes } });
  const setRule = (i, changes) => setLogic({ rules: logic.rules.map((r, idx) => (idx === i ? { ...r, ...changes } : r)) });

  return (
    <section className="builder-panel" aria-labelledby="props-title">
      <h2 className="h6" id="props-title">Propiedades: {t.label}</h2>

      <Row id="p-label" label={field.field_type === 'paragraph' ? 'Texto' : field.field_type === 'heading' ? 'Título' : 'Pregunta o etiqueta'}>
        <input id="p-label" ref={labelRef} className="form-control" value={field.label} onChange={set('label')} />
      </Row>

      {!isDecorative && (
        <>
          <div className="form-check form-switch mb-3">
            <input className="form-check-input" type="checkbox" role="switch" id="p-required" checked={!!field.is_required} onChange={set('is_required')} />
            <label className="form-check-label" htmlFor="p-required">Respuesta obligatoria</label>
          </div>
          <Row id="p-help" label="Texto de ayuda" hint="Se muestra bajo el campo; los lectores de pantalla lo anuncian.">
            <input id="p-help" className="form-control" value={field.help_text || ''} onChange={set('help_text')} />
          </Row>
        </>
      )}

      {(isText || ['number', 'select'].includes(field.field_type)) && (
        <Row id="p-ph" label="Texto de ejemplo (placeholder)">
          <input id="p-ph" className="form-control" value={field.placeholder || ''} onChange={set('placeholder')} />
        </Row>
      )}

      {hasOptions && (
        <Row id="p-options" label="Opciones" hint="Escriba una opción por línea.">
          <textarea id="p-options" className="form-control" rows={5}
            value={normalizeOptions(field.options_json).map((o) => o.label).join('\n')}
            onChange={(e) => onChange({ options_json: e.target.value.split('\n').map((l) => ({ label: l, value: l })) })} />
        </Row>
      )}

      {!isDecorative && (
        <Row id="p-width" label="Ancho en pantalla">
          <select id="p-width" className="form-select" value={field.width || 'full'} onChange={set('width')}>
            <option value="full">Completo</option><option value="half">Mitad</option><option value="third">Un tercio</option>
          </select>
        </Row>
      )}

      {isMultiStep && (
        <Row id="p-step" label="Paso del formulario">
          <input id="p-step" type="number" min="1" className="form-control" value={field.step_number || 1} onChange={(e) => onChange({ step_number: Math.max(1, Number(e.target.value) || 1) })} />
        </Row>
      )}

      {!isDecorative && (
        <details className="mb-3">
          <summary className="fw-semibold mb-2">Validación y opciones avanzadas</summary>
          {isNumeric && (
            <div className="row g-2">
              <div className="col-6"><Row id="p-min" label="Valor mínimo"><input id="p-min" type="number" className="form-control" value={field.min_value ?? ''} onChange={set('min_value')} /></Row></div>
              <div className="col-6"><Row id="p-max" label="Valor máximo"><input id="p-max" type="number" className="form-control" value={field.max_value ?? ''} onChange={set('max_value')} /></Row></div>
            </div>
          )}
          {isText && (
            <>
              <div className="row g-2">
                <div className="col-6"><Row id="p-minl" label="Mín. caracteres"><input id="p-minl" type="number" min="0" className="form-control" value={field.min_length ?? ''} onChange={set('min_length')} /></Row></div>
                <div className="col-6"><Row id="p-maxl" label="Máx. caracteres"><input id="p-maxl" type="number" min="0" className="form-control" value={field.max_length ?? ''} onChange={set('max_length')} /></Row></div>
              </div>
              <Row id="p-regex" label="Patrón de validación (expresión regular)" hint="Opcional. Ejemplo: ^[0-9]{10}$">
                <input id="p-regex" className="form-control font-monospace" value={field.regex_pattern || ''} onChange={set('regex_pattern')} />
              </Row>
            </>
          )}
          <Row id="p-vmsg" label="Mensaje de error personalizado" hint="Mensaje claro que indique cómo corregir el dato.">
            <input id="p-vmsg" className="form-control" value={field.validation_message || ''} onChange={set('validation_message')} />
          </Row>
          {isFile && (
            <>
              <Row id="p-types" label="Tipos de archivo permitidos" hint="Tipos MIME separados por coma, ej. application/pdf,image/png">
                <input id="p-types" className="form-control" value={field.allowed_file_types || ''} onChange={set('allowed_file_types')} />
              </Row>
              <div className="row g-2">
                <div className="col-6"><Row id="p-size" label="Tamaño máx. (MB)"><input id="p-size" type="number" min="1" className="form-control" value={field.max_file_size_mb ?? 10} onChange={set('max_file_size_mb')} /></Row></div>
                <div className="col-6"><Row id="p-files" label="Máx. archivos"><input id="p-files" type="number" min="1" className="form-control" value={field.max_files ?? 1} onChange={set('max_files')} /></Row></div>
              </div>
            </>
          )}
          <Row id="p-key" label="Clave técnica del campo" hint="Identifica el dato en reportes y exportaciones. Solo minúsculas, números y guion bajo.">
            <input id="p-key" className={`form-control font-monospace${keyError ? ' is-invalid' : ''}`} value={field.field_key} aria-invalid={keyError ? true : undefined} aria-describedby={keyError ? 'p-key-err' : undefined}
              onChange={(e) => onChange({ field_key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })} />
            {keyError && <div className="invalid-feedback d-block" id="p-key-err">{keyError}</div>}
          </Row>
          <Row id="p-aria" label="Etiqueta accesible (aria-label)" hint="Opcional. Por defecto se usa la etiqueta del campo.">
            <input id="p-aria" className="form-control" value={field.aria_label || ''} onChange={set('aria_label')} />
          </Row>
        </details>
      )}

      {others.length > 0 && (
        <details className="mb-2" open={logic.rules.length > 0}>
          <summary className="fw-semibold mb-2">Lógica condicional</summary>
          <p className="form-text">Muestre u oculte este campo según las respuestas a otros campos.</p>
          {logic.rules.length > 0 && (
            <div className="row g-2 mb-2">
              <div className="col-6">
                <label htmlFor="c-action" className="form-label mb-1">Acción</label>
                <select id="c-action" className="form-select" value={logic.action} onChange={(e) => setLogic({ action: e.target.value })}>
                  <option value="show">Mostrar si…</option><option value="hide">Ocultar si…</option>
                </select>
              </div>
              <div className="col-6">
                <label htmlFor="c-mode" className="form-label mb-1">Cumple</label>
                <select id="c-mode" className="form-select" value={logic.logic} onChange={(e) => setLogic({ logic: e.target.value })}>
                  <option value="all">Todas las reglas</option><option value="any">Alguna regla</option>
                </select>
              </div>
            </div>
          )}
          {logic.rules.map((r, i) => (
            <fieldset key={i} className="border rounded p-2 mb-2">
              <legend className="small fw-semibold float-none w-auto px-1 mb-1">Regla {i + 1}</legend>
              <label htmlFor={`r-f-${i}`} className="visually-hidden">Campo de la regla {i + 1}</label>
              <select id={`r-f-${i}`} className="form-select mb-1" value={r.field_key} onChange={(e) => setRule(i, { field_key: e.target.value })}>
                {others.map((o) => <option key={o._cid} value={o.field_key}>{o.label}</option>)}
              </select>
              <label htmlFor={`r-o-${i}`} className="visually-hidden">Operador de la regla {i + 1}</label>
              <select id={`r-o-${i}`} className="form-select mb-1" value={r.operator} onChange={(e) => setRule(i, { operator: e.target.value })}>
                {OPERATORS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              {!['is_empty', 'is_not_empty'].includes(r.operator) && (
                <>
                  <label htmlFor={`r-v-${i}`} className="visually-hidden">Valor de la regla {i + 1}</label>
                  <input id={`r-v-${i}`} className="form-control mb-1" placeholder="Valor" value={r.value ?? ''} onChange={(e) => setRule(i, { value: e.target.value })} />
                </>
              )}
              <button type="button" className="btn btn-link btn-sm text-danger p-0" onClick={() => setLogic({ rules: logic.rules.filter((_, idx) => idx !== i) })}>Quitar regla {i + 1}</button>
            </fieldset>
          ))}
          <button type="button" className="btn btn-outline-salir btn-sm" onClick={() => setLogic({ rules: [...logic.rules, { field_key: others[0].field_key, operator: 'equals', value: '' }] })}>
            <i className="bi bi-plus-lg me-1" aria-hidden="true"></i>Agregar regla
          </button>
        </details>
      )}
    </section>
  );
});

export default FieldProperties;
