import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formsApi } from '../services/formsApi.js';
import { compileConditions, createField, fromApiField, mergeDesign, mergeSettings, uniqueKey } from '../builder/model.js';

// Columnas del backend que se editan en Configuraciones (se guardan con PATCH /forms/:id).
const FORM_COLUMNS = [
  'title', 'description', 'success_message', 'error_message', 'redirect_url', 'redirect_delay_seconds',
  'recaptcha_enabled', 'recaptcha_version', 'notify_email_enabled', 'notify_emails', 'autoresponder_enabled',
  'autoresponder_subject', 'autoresponder_body', 'autoresponder_field_key', 'reference_id_prefix',
  'reference_id_format', 'allow_prefill_from_url', 'submission_pdf_enabled', 'submission_pdf_template',
  'is_multi_step', 'limit_one_submission_per_user', 'submission_limit', 'opens_at', 'closes_at',
];

const toLocalInput = (v) => (v ? new Date(v).toISOString().slice(0, 16) : '');

// Estado completo del constructor: formulario, campos, diseño y configuraciones.
// Las opciones que el backend aún no tiene como columna viajan dentro de
// custom_attributes_json._settings (ver README).
export function useFormBuilder(id) {
  const [state, setState] = useState({ loading: true, error: '' });
  const [form, setForm] = useState(null);
  const [fields, setFields] = useState([]);
  const [design, setDesign] = useState(null);
  const [settings, setSettings] = useState(null);
  const [selected, setSelected] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [passwordDraft, setPasswordDraft] = useState('');
  const history = useRef([]);

  const load = useCallback(async () => {
    setState({ loading: true, error: '' });
    try {
      const { data } = await formsApi.get(id);
      const { fields: apiFields = [], ...rest } = data;
      const extra = rest.custom_attributes_json || {};
      setForm({
        ...rest,
        opens_at: toLocalInput(rest.opens_at),
        closes_at: toLocalInput(rest.closes_at),
      });
      setFields(apiFields.map(fromApiField));
      setDesign(mergeDesign(rest.style_json));
      setSettings(mergeSettings(extra._settings));
      setDirty(false);
      setState({ loading: false, error: '' });
    } catch (err) {
      setState({ loading: false, error: err.message });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Aviso al cerrar la pestaña con cambios sin guardar
  useEffect(() => {
    if (!dirty) return undefined;
    const onBefore = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBefore);
    return () => window.removeEventListener('beforeunload', onBefore);
  }, [dirty]);

  const touch = () => setDirty(true);

  const updateForm = useCallback((patch) => {
    setForm((f) => ({ ...f, ...patch }));
    touch();
  }, []);
  const updateDesign = useCallback((patch) => {
    setDesign((d) => ({ ...d, ...patch }));
    touch();
  }, []);
  const updateSettings = useCallback((patch) => {
    setSettings((s) => ({ ...s, ...patch }));
    touch();
  }, []);

  // ----- campos -----
  const snapshot = () => {
    history.current = [...history.current.slice(-19), fields];
  };
  const mutate = (fn) => {
    snapshot();
    setFields(fn);
    touch();
  };

  const addField = useCallback(
    (item, index) => {
      const field = createField(item, fields);
      snapshot();
      setFields((list) => {
        const i = index === undefined || index === null ? list.length : Math.min(Math.max(index, 0), list.length);
        return [...list.slice(0, i), field, ...list.slice(i)];
      });
      setSelected(field.cid);
      touch();
      return field;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fields]
  );

  const updateField = useCallback((cid, patch) => {
    setFields((list) => list.map((f) => (f.cid === cid ? { ...f, ...patch } : f)));
    touch();
  }, []);

  // Cambiar la etiqueta no modifica la clave de un campo ya guardado (protege respuestas existentes)
  const renameField = useCallback((cid, label) => {
    setFields((list) =>
      list.map((f) => {
        if (f.cid !== cid) return f;
        const next = { ...f, label };
        if (!f.id) next.field_key = uniqueKey(label, list, cid);
        return next;
      })
    );
    touch();
  }, []);

  const moveField = useCallback((from, to) => {
    if (from === to) return;
    snapshot();
    setFields((list) => {
      const copy = [...list];
      const [m] = copy.splice(from, 1);
      copy.splice(to > from ? to - 1 : to, 0, m);
      return copy;
    });
    touch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  const nudge = useCallback((cid, delta) => {
    snapshot();
    setFields((list) => {
      const i = list.findIndex((f) => f.cid === cid);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= list.length) return list;
      const copy = [...list];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
    touch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  const duplicateField = useCallback((cid) => {
    snapshot();
    setFields((list) => {
      const i = list.findIndex((f) => f.cid === cid);
      if (i < 0) return list;
      const src = list[i];
      const { id: _id, uuid: _uuid, ...rest } = src;
      const copy = { ...rest, cid: `d${Date.now().toString(36)}`, label: `${src.label} (copia)`, field_key: '' };
      copy.field_key = uniqueKey(copy.label, list, copy.cid);
      setSelected(copy.cid);
      return [...list.slice(0, i + 1), copy, ...list.slice(i + 1)];
    });
    touch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  const removeField = useCallback((cid) => {
    snapshot();
    setFields((list) => list.filter((f) => f.cid !== cid));
    setSelected((s) => (s === cid ? null : s));
    // las reglas que usan el campo eliminado dejan de tener sentido
    setSettings((s) => {
      const gone = fields.find((f) => f.cid === cid)?.field_key;
      return gone ? { ...s, conditions: s.conditions.filter((c) => c.target !== gone && c.source !== gone) } : s;
    });
    touch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  const undo = useCallback(() => {
    const prev = history.current.pop();
    if (prev) {
      setFields(prev);
      touch();
    }
  }, []);

  // ----- guardado -----
  const save = useCallback(async () => {
    setSaving(true);
    setSaveError('');
    try {
      const compiled = compileConditions(fields, settings.conditions);
      const { data: saved } = await formsApi.saveFields(id, compiled.map(({ cid: _c, ...f }) => f));
      // Reasocia los ids devueltos por el servidor, en el mismo orden
      const next = compiled.map((f, i) => ({ ...f, id: saved?.[i]?.id ?? f.id, uuid: saved?.[i]?.uuid ?? f.uuid }));
      setFields(next);

      const body = {};
      FORM_COLUMNS.forEach((k) => {
        if (form[k] !== undefined) body[k] = form[k] === '' ? null : form[k];
      });
      body.style_json = design;
      body.custom_attributes_json = { ...(form.custom_attributes_json || {}), _settings: settings };
      const res = await formsApi.update(id, body);
      setWarnings(res?.meta?.accessibility_warnings || []);
      if (passwordDraft !== '') {
        await formsApi.setPassword(id, passwordDraft === '\u0000' ? '' : passwordDraft);
        setForm((f) => ({ ...f, is_password_protected: passwordDraft !== '\u0000' }));
        setPasswordDraft('');
      }
      setDirty(false);
      setSavedAt(new Date());
      return true;
    } catch (err) {
      setSaveError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [id, fields, form, design, settings, passwordDraft]);

  const setStatus = useCallback(
    async (status) => {
      const { data } = await formsApi.setStatus(id, status);
      setForm((f) => ({ ...f, status: data?.status || status }));
    },
    [id]
  );

  const selectedField = useMemo(() => fields.find((f) => f.cid === selected) || null, [fields, selected]);

  return {
    ...state, form, fields, design, settings, selected, selectedField, dirty, saving, savedAt, saveError, warnings,
    setSelected, updateForm, updateDesign, updateSettings, addField, updateField, renameField, moveField, nudge,
    duplicateField, removeField, undo, save, setStatus, reload: load, setPasswordDraft,
    canUndo: history.current.length > 0,
  };
}
