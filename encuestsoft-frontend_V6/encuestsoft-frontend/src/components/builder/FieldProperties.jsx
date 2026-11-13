import { HAS_OPTIONS, NO_INPUT, TEXTUAL, itemKey } from '../../builder/catalog.js';
import { itemOf } from '../../builder/model.js';
import { PlusIcon, TrashIcon } from '../Icons.jsx';

function Row({ label, hint, children, id }) {
  return (
    <div className="prop">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

// Panel derecho: propiedades del campo seleccionado, según su tipo.
export default function FieldProperties({ b }) {
  const f = b.selectedField;
  if (!f) {
    return (
      <aside className="b-props" aria-label="Propiedades del campo">
        <h2 className="b-title">Propiedades</h2>
        <p className="b-hint">Selecciona un campo del formulario para editar sus propiedades.</p>
        <hr />
        <Row label="Nombre del formulario" id="p-title">
          <input id="p-title" type="text" value={b.form.title} onChange={(e) => b.updateForm({ title: e.target.value })} maxLength={200} />
        </Row>
        <Row label="Descripción" id="p-desc">
          <textarea id="p-desc" rows={3} value={b.form.description || ''} onChange={(e) => b.updateForm({ description: e.target.value })} />
        </Row>
      </aside>
    );
  }
  const t = f.field_type;
  const set = (patch) => b.updateField(f.cid, patch);
  const item = itemOf(f);
  const opts = f.options_json || [];
  const setOpts = (next) => set({ options_json: next });
  const structural = NO_INPUT.includes(t);
  const p = (k) => `p-${k}`;

  return (
    <aside className="b-props" aria-label="Propiedades del campo">
      <h2 className="b-title">{item?.label || t}</h2>

      {t === 'paragraph' ? (
        <Row label="Texto" id={p('label')}>
          <textarea id={p('label')} rows={4} value={f.label} onChange={(e) => set({ label: e.target.value })} />
        </Row>
      ) : t !== 'divider' ? (
        <Row label={t === 'heading' ? 'Título' : 'Pregunta o etiqueta'} id={p('label')}>
          <input id={p('label')} type="text" value={f.label} onChange={(e) => b.renameField(f.cid, e.target.value)} maxLength={255} />
        </Row>
      ) : (
        <p className="b-hint">El divisor no tiene propiedades.</p>
      )}

      {!structural && t !== 'hidden' && (
        <>
          {(TEXTUAL.includes(t) || ['number', 'select'].includes(t)) && (
            <Row label="Texto de ejemplo (marcador)" id={p('ph')}>
              <input id={p('ph')} type="text" value={f.placeholder || ''} onChange={(e) => set({ placeholder: e.target.value })} maxLength={255} />
            </Row>
          )}
          <Row label="Texto de ayuda" id={p('help')} hint="Aparece bajo el campo y lo leen los lectores de pantalla.">
            <input id={p('help')} type="text" value={f.help_text || ''} onChange={(e) => set({ help_text: e.target.value })} maxLength={500} />
          </Row>
          <label className="check">
            <input type="checkbox" checked={Boolean(f.is_required)} onChange={(e) => set({ is_required: e.target.checked })} /> Obligatorio
          </label>
          <Row label="Ancho en el formulario" id={p('w')}>
            <select id={p('w')} value={f.width || 'full'} onChange={(e) => set({ width: e.target.value })}>
              <option value="full">Completo</option>
              <option value="half">Mitad</option>
              <option value="third">Un tercio</option>
            </select>
          </Row>
        </>
      )}

      {t === 'hidden' && (
        <Row label="Valor" id={p('def')} hint="Se envía con la respuesta sin mostrarse. Útil con parámetros de la URL.">
          <input id={p('def')} type="text" value={f.default_value || ''} onChange={(e) => set({ default_value: e.target.value })} />
        </Row>
      )}

      {HAS_OPTIONS.includes(t) && (
        <fieldset className="prop">
          <legend>Opciones</legend>
          <ul className="opt-list">
            {opts.map((o, i) => (
              <li key={i}>
                <input
                  type="text"
                  aria-label={`Texto de la opción ${i + 1}`}
                  value={o.label}
                  onChange={(e) => setOpts(opts.map((x, j) => (j === i ? { label: e.target.value, value: x.value } : x)))}
                />
                <button type="button" className="icon-plain is-danger" aria-label={`Quitar opción ${i + 1}`} disabled={opts.length <= 1} onClick={() => setOpts(opts.filter((_, j) => j !== i))}>
                  <TrashIcon width={15} height={15} />
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              const n = opts.length + 1;
              setOpts([...opts, { label: `Opción ${n}`, value: `opcion_${Date.now().toString(36)}_${n}` }]);
            }}
          >
            <PlusIcon width={14} height={14} /> Agregar opción
          </button>
        </fieldset>
      )}

      {t === 'rating' && (
        <Row label="Número de estrellas" id={p('stars')}>
          <select id={p('stars')} value={f.max_value || 5} onChange={(e) => set({ max_value: Number(e.target.value) })}>
            {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </Row>
      )}

      {['text', 'textarea', 'password'].includes(t) && (
        <div className="prop-grid">
          <Row label="Mínimo de caracteres" id={p('minl')}>
            <input id={p('minl')} type="number" min="0" value={f.min_length ?? ''} onChange={(e) => set({ min_length: num(e.target.value) })} />
          </Row>
          <Row label="Máximo de caracteres" id={p('maxl')}>
            <input id={p('maxl')} type="number" min="0" value={f.max_length ?? ''} onChange={(e) => set({ max_length: num(e.target.value) })} />
          </Row>
        </div>
      )}
      {t === 'number' && (
        <div className="prop-grid">
          <Row label="Valor mínimo" id={p('minv')}>
            <input id={p('minv')} type="number" value={f.min_value ?? ''} onChange={(e) => set({ min_value: num(e.target.value) })} />
          </Row>
          <Row label="Valor máximo" id={p('maxv')}>
            <input id={p('maxv')} type="number" value={f.max_value ?? ''} onChange={(e) => set({ max_value: num(e.target.value) })} />
          </Row>
        </div>
      )}
      {['text', 'phone'].includes(t) && (
        <>
          <Row label="Patrón de validación (expresión regular)" id={p('re')}>
            <input id={p('re')} type="text" value={f.regex_pattern || ''} onChange={(e) => set({ regex_pattern: e.target.value })} />
          </Row>
          {f.regex_pattern && (
            <Row label="Mensaje si no cumple" id={p('vm')}>
              <input id={p('vm')} type="text" value={f.validation_message || ''} onChange={(e) => set({ validation_message: e.target.value })} />
            </Row>
          )}
        </>
      )}
      {!structural && t !== 'hidden' && !['file', 'image', 'signature', 'rating'].includes(t) && !HAS_OPTIONS.includes(t) && (
        <Row label="Valor por defecto" id={p('dv')}>
          <input id={p('dv')} type="text" value={f.default_value || ''} onChange={(e) => set({ default_value: e.target.value })} />
        </Row>
      )}

      {['file', 'image'].includes(t) && (
        <>
          <Row label="Tipos permitidos" id={p('ft')} hint="Tipos MIME separados por comas.">
            <input id={p('ft')} type="text" value={f.allowed_file_types || ''} onChange={(e) => set({ allowed_file_types: e.target.value })} />
          </Row>
          <div className="prop-grid">
            <Row label="Tamaño máx. (MB)" id={p('fs')}>
              <input id={p('fs')} type="number" min="1" max="50" value={f.max_file_size_mb ?? 10} onChange={(e) => set({ max_file_size_mb: num(e.target.value) })} />
            </Row>
            <Row label="Máx. de archivos" id={p('fm')}>
              <input id={p('fm')} type="number" min="1" max="10" value={f.max_files ?? 1} onChange={(e) => set({ max_files: num(e.target.value) })} />
            </Row>
          </div>
        </>
      )}

      {!structural && (
        <details className="prop-adv">
          <summary>Accesibilidad y avanzado</summary>
          <Row label="Etiqueta para lectores de pantalla (aria-label)" id={p('aria')} hint="Si se deja vacía se usa la pregunta.">
            <input id={p('aria')} type="text" value={f.aria_label || ''} onChange={(e) => set({ aria_label: e.target.value })} />
          </Row>
          {TEXTUAL.includes(t) && (
            <Row label="Autocompletado del navegador" id={p('ac')}>
              <input id={p('ac')} type="text" value={f.autocomplete_attr || ''} placeholder="Automático" onChange={(e) => set({ autocomplete_attr: e.target.value })} />
            </Row>
          )}
          <Row label="Clave del campo" id={p('key')} hint="Identifica la respuesta en reportes, URL y PDF. No cambia tras guardar.">
            <input id={p('key')} type="text" value={f.field_key} readOnly />
          </Row>
        </details>
      )}
    </aside>
  );
}
