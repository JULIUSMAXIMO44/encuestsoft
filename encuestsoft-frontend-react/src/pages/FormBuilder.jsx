/**
 * FormBuilder — constructor de formularios (drag & drop).
 * ------------------------------------------------------------------
 * Pestañas: Constructor (paleta + lienzo + propiedades), Configuración y Vista previa.
 * Persistencia: GET /forms/:id y PUT /forms/:id/fields (guarda el orden = posición).
 *
 * Usabilidad: atajo Ctrl+S, aviso de cambios sin guardar, anuncios aria-live al
 * agregar/mover campos y alternativa de teclado al arrastrar y soltar.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import SimpleAppNav from '../components/SimpleAppNav.jsx';
import SimpleFooter from '../components/SimpleFooter.jsx';
import FieldPalette from '../components/builder/FieldPalette.jsx';
import FieldCanvas from '../components/builder/FieldCanvas.jsx';
import FieldProperties from '../components/builder/FieldProperties.jsx';
import FormSettings from '../components/builder/FormSettings.jsx';
import FormRenderer from '../components/FormRenderer.jsx';
import ShareModal from '../components/ShareModal.jsx';
import { formsApi } from '../services/api.js';
import { useUi } from '../context/UiContext.jsx';
import { FIELD_TYPES, OPTION_TYPES, getFieldType, makeFieldKey, normalizeOptions } from '../utils/fieldTypes.js';
import { STATUS_LABELS } from '../utils/format.js';
import { uid } from '../utils/helpers.js';

const TABS = [['constructor', 'Constructor'], ['config', 'Configuración'], ['vista', 'Vista previa']];

/** Convierte un campo del servidor en un campo local (con id temporal para React). */
const toLocal = (f) => ({ ...f, _cid: uid('f'), options_json: normalizeOptions(f.options_json) });

/** Crea un campo nuevo con valores por defecto según el tipo. */
function newField(type, existing, step = 1) {
  const def = FIELD_TYPES.find((t) => t.type === type);
  const label = def.label;
  const base = { _cid: uid('f'), field_type: type, label, field_key: makeFieldKey(label, existing.map((f) => f.field_key)), is_required: false, width: 'full', step_number: step, position: existing.length };
  if (def.hasOptions) base.options_json = [1, 2].map((n) => ({ label: `Opción ${n}`, value: `Opción ${n}` }));
  if (type === 'file') Object.assign(base, { allowed_file_types: 'application/pdf,image/jpeg,image/png', max_file_size_mb: 10, max_files: 1 });
  return base;
}

/** Prepara los campos locales para PUT /forms/:id/fields. */
function toPayload(fields) {
  const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));
  return fields.map((f, i) => {
    const hasOptions = OPTION_TYPES.includes(f.field_type);
    const rules = f.conditional_logic_json?.rules || [];
    return {
      id: f.id, field_key: f.field_key, field_type: f.field_type, label: f.label.trim(), placeholder: f.placeholder || null, help_text: f.help_text || null,
      position: i, step_number: f.step_number || 1, is_required: !!f.is_required,
      min_length: num(f.min_length), max_length: num(f.max_length), min_value: num(f.min_value), max_value: num(f.max_value),
      regex_pattern: f.regex_pattern || null, validation_message: f.validation_message || null,
      options_json: hasOptions ? normalizeOptions(f.options_json.filter((o) => o.label.trim())) : null,
      default_value: f.default_value || null, allowed_file_types: f.allowed_file_types || null,
      max_file_size_mb: num(f.max_file_size_mb) ?? 10, max_files: num(f.max_files) ?? 1,
      aria_label: f.aria_label || null, autocomplete_attr: f.autocomplete_attr || undefined,
      conditional_logic_json: rules.length ? f.conditional_logic_json : null, custom_attributes_json: f.custom_attributes_json || null, width: f.width || 'full',
    };
  });
}

export default function FormBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { notify, confirm } = useUi();
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'constructor';

  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [status, setStatus] = useState('loading');
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [sharing, setSharing] = useState(null);
  const labelRef = useRef(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const data = await formsApi.get(id);
      setForm(data);
      setFields((data.fields || []).map(toLocal));
      setStatus('ready');
    } catch (err) {
      setLoadError(err.message);
      setStatus('error');
    }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  /* --- Aviso de cambios sin guardar --- */
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const edit = (updater, message) => {
    setFields(updater);
    setDirty(true);
    if (message) setAnnounce(message);
  };

  const selectedField = fields.find((f) => f._cid === selected) || null;
  const currentStep = form?.is_multi_step ? Math.max(1, ...fields.map((f) => f.step_number || 1)) : 1;

  /* --- Operaciones sobre campos --- */
  const addField = (type, index = fields.length) => {
    const f = newField(type, fields, currentStep);
    edit((prev) => [...prev.slice(0, index), f, ...prev.slice(index)], `Campo ${getFieldType(type).label} agregado en la posición ${index + 1}.`);
    setSelected(f._cid);
  };
  const handleDropAt = (index, { newType, moveFrom }) => {
    if (newType) return addField(newType, index);
    if (moveFrom !== '') {
      const from = Number(moveFrom);
      edit((prev) => {
        const next = [...prev];
        const [m] = next.splice(from, 1);
        next.splice(index > from ? index - 1 : index, 0, m);
        return next;
      }, 'Campo reordenado.');
    }
    return undefined;
  };
  const moveField = (i, delta) => edit((prev) => {
    const next = [...prev];
    [next[i], next[i + delta]] = [next[i + delta], next[i]];
    return next;
  }, `${fields[i].label} movido a la posición ${i + delta + 1} de ${fields.length}.`);
  const duplicateField = (i) => {
    const src = fields[i];
    const copy = { ...src, id: undefined, _cid: uid('f'), label: `${src.label} (copia)`, field_key: makeFieldKey(src.field_key, fields.map((f) => f.field_key)) };
    edit((prev) => [...prev.slice(0, i + 1), copy, ...prev.slice(i + 1)], 'Campo duplicado.');
    setSelected(copy._cid);
  };
  const removeField = async (i) => {
    const ok = await confirm({ title: 'Eliminar campo', message: `¿Eliminar el campo "${fields[i].label}"? Los cambios se aplican al guardar.`, confirmLabel: 'Eliminar', danger: true });
    if (!ok) return;
    const gone = fields[i];
    edit((prev) => prev.filter((_, idx) => idx !== i), `Campo ${gone.label} eliminado.`);
    if (selected === gone._cid) setSelected(null);
  };
  const changeSelected = (changes) => edit((prev) => prev.map((f) => (f._cid === selected ? { ...f, ...changes } : f)));
  const selectField = (cid, focus) => { setSelected(cid); if (focus) setTimeout(() => labelRef.current?.focus(), 0); };

  /* --- Validación previa al guardado --- */
  const keyErrors = useMemo(() => {
    const out = {};
    const seen = {};
    fields.forEach((f) => {
      if (!/^[a-z0-9_]+$/.test(f.field_key)) out[f._cid] = 'La clave solo admite minúsculas, números y guion bajo.';
      else if (seen[f.field_key]) out[f._cid] = 'Esta clave ya la usa otro campo.';
      seen[f.field_key] = true;
    });
    return out;
  }, [fields]);

  const save = useCallback(async () => {
    const bad = fields.find((f) => !f.label.trim());
    if (bad) { setSelected(bad._cid); notify('Todos los campos necesitan un título.'); return false; }
    const badKey = fields.find((f) => keyErrors[f._cid]);
    if (badKey) { setSelected(badKey._cid); notify(`Corrija la clave del campo "${badKey.label}".`); return false; }
    const noOpts = fields.find((f) => OPTION_TYPES.includes(f.field_type) && f.options_json.filter((o) => o.label.trim()).length < 1);
    if (noOpts) { setSelected(noOpts._cid); notify(`Agregue al menos una opción en "${noOpts.label}".`); return false; }
    setSaving(true);
    try {
      const saved = await formsApi.saveFields(id, toPayload(fields));
      // Se conservan los ids asignados por el servidor para no recrear los campos en el siguiente guardado.
      setFields((prev) => prev.map((f, i) => ({ ...f, id: saved[i]?.id ?? f.id })));
      setDirty(false);
      notify('Formulario guardado correctamente.');
      return true;
    } catch (err) {
      notify(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [fields, id, keyErrors, notify]);

  // Atajo Ctrl/Cmd + S
  useEffect(() => {
    const onKey = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save]);

  const setTab = (key) => setParams({ tab: key }, { replace: true });
  async function goBack() {
    if (dirty && !(await confirm({ title: 'Cambios sin guardar', message: 'Tiene cambios sin guardar. Si sale ahora se perderán.', confirmLabel: 'Salir sin guardar', danger: true }))) return;
    navigate('/dashboard');
  }

  const previewForm = useMemo(() => ({ ...form, fields: fields.map((f, i) => ({ ...f, position: i, options_json: f.options_json })), recaptcha_enabled: false }), [form, fields]);

  if (status === 'loading') return (<><SimpleAppNav /><main className="container page-main" id="main-content"><p role="status" className="py-5 text-center"><span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Cargando formulario…</p></main></>);
  if (status === 'error') return (<><SimpleAppNav /><main className="container page-main" id="main-content"><div className="alert alert-danger" role="alert">{loadError} <button type="button" className="btn btn-outline-salir btn-sm ms-2" onClick={load}>Reintentar</button> <Link to="/dashboard">Volver al panel</Link></div></main></>);

  return (
    <>
      <SimpleAppNav />
      <main className="container-xl page-main" id="main-content">
        <div className="simple-page-header d-flex justify-content-between align-items-start flex-wrap gap-2">
          <div>
            <p className="breadcrumb-nav"><Link to="/">Inicio</Link> / <Link to="/dashboard">Panel</Link> / Constructor</p>
            <h1>{form.title} <span className="badge text-bg-secondary fs-6 align-middle">{STATUS_LABELS[form.status]}</span></h1>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button type="button" className="btn btn-outline-salir" onClick={goBack}><i className="bi bi-arrow-left me-1" aria-hidden="true"></i>Volver</button>
            <button type="button" className="btn btn-outline-salir" onClick={() => setSharing(form)}><i className="bi bi-share me-1" aria-hidden="true"></i>Compartir</button>
            <button type="button" className="btn btn-agregar-secciones" onClick={save} disabled={saving || !dirty} title="Ctrl + S">
              {saving && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
              {dirty ? 'Guardar cambios' : 'Guardado'}
            </button>
          </div>
        </div>

        <ul className="nav nav-tabs mb-3" role="tablist" aria-label="Secciones del constructor">
          {TABS.map(([key, label]) => (
            <li className="nav-item" role="presentation" key={key}>
              <button type="button" role="tab" id={`tab-${key}`} className={`nav-link${tab === key ? ' active' : ''}`} aria-selected={tab === key} aria-controls={`panel-${key}`} tabIndex={tab === key ? 0 : -1} onClick={() => setTab(key)}>{label}</button>
            </li>
          ))}
        </ul>
        <div className="visually-hidden" role="status" aria-live="polite">{announce}</div>
        {dirty && <p className="small text-warning-emphasis" role="note"><i className="bi bi-exclamation-circle me-1" aria-hidden="true"></i>Hay cambios sin guardar.</p>}

        {tab === 'constructor' && (
          <div role="tabpanel" id="panel-constructor" aria-labelledby="tab-constructor" className="row g-3">
            <div className="col-lg-3"><FieldPalette onAdd={(t) => addField(t)} /></div>
            <div className="col-lg-5">
              <FieldCanvas fields={fields} selectedCid={selected} onSelect={selectField} onDropAt={handleDropAt} onMove={moveField} onDuplicate={duplicateField} onRemove={removeField} />
            </div>
            <div className="col-lg-4">
              <FieldProperties ref={labelRef} field={selectedField} allFields={fields} isMultiStep={!!form.is_multi_step} keyError={selectedField && keyErrors[selectedField._cid]} onChange={changeSelected} />
            </div>
          </div>
        )}

        {tab === 'config' && (
          <div role="tabpanel" id="panel-config" aria-labelledby="tab-config">
            <FormSettings form={form} onSaved={(f) => setForm((prev) => ({ ...prev, ...f }))} />
          </div>
        )}

        {tab === 'vista' && (
          <div role="tabpanel" id="panel-vista" aria-labelledby="tab-vista" className="content-card" style={{ maxWidth: 820 }}>
            <p className="alert alert-info py-2 small"><i className="bi bi-info-circle me-1" aria-hidden="true"></i>Vista previa con los cambios actuales. Las respuestas no se guardan.</p>
            <h2 className="h3">{form.title}</h2>
            {form.description && <p className="lead">{form.description}</p>}
            {fields.length === 0 ? <p className="text-muted">Agregue campos en el constructor para ver el formulario.</p>
              : <FormRenderer key={fields.map((f) => f._cid + f.field_type).join()} form={previewForm} submitLabel="Enviar (vista previa)" onSubmit={() => notify('Vista previa: no se envió ninguna respuesta.')} />}
          </div>
        )}
      </main>
      <SimpleFooter />
      <ShareModal form={sharing} onClose={() => setSharing(null)} onUpdated={(f) => { setForm((p) => ({ ...p, ...f })); setSharing((c) => (c ? { ...c, ...f } : c)); }} />
    </>
  );
}
