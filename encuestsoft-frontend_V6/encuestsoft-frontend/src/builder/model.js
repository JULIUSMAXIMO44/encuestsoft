import { findItem, HAS_OPTIONS } from './catalog.js';

let counter = 0;
export const newCid = () => `c${Date.now().toString(36)}${(counter += 1)}`;

// ---------- Diseño por defecto (pestaña Diseño) ----------
export const DEFAULT_DESIGN = {
  scheme: 'institucional',
  questionColor: '#1b1b1b',
  textColor: '#1b1b1b',
  backgroundColor: '#f6f7f8', // fondo del campo
  errorColor: '#b00020',
  requiredColor: '#b00020',
  pageBg: { type: 'solid', color: '#f5f5f5', from: '#fff7cc', to: '#ffffff', direction: '135deg', image: '' },
  formBg: { type: 'solid', color: '#ffffff', from: '#ffffff', to: '#f0f7f2', direction: '180deg', image: '' },
  fontFamily: 'Inter',
  questionSize: 14,
  radius: 8,
  size: 'medium',
  hPos: 'center',
  vPos: 'top',
  logo: '',
};

export const SCHEMES = {
  institucional: { label: 'Institucional', q: '#1b1b1b', t: '#1b1b1b', f: '#f6f7f8', page: '#f5f5f5', form: '#ffffff', accent: '#1d8239' },
  claro: { label: 'Claro', q: '#1b1b1b', t: '#333333', f: '#ffffff', page: '#ffffff', form: '#ffffff', accent: '#0a4a8a' },
  oscuro: { label: 'Oscuro', q: '#ffffff', t: '#f0f0f0', f: '#2b2f33', page: '#16181a', form: '#1f2326', accent: '#f5c400' },
  suave: { label: 'Verde suave', q: '#14351d', t: '#1f3a28', f: '#f1f8f3', page: '#e8f3ec', form: '#ffffff', accent: '#1d8239' },
};

export const GRADIENTS = [
  ['Amanecer', '#fff7cc', '#ffffff'],
  ['Menta', '#e8f3ec', '#ffffff'],
  ['Cielo', '#e3f0fb', '#ffffff'],
  ['Lavanda', '#efe9fb', '#ffffff'],
  ['Atardecer', '#ffe9d6', '#fff7cc'],
];

export const FONTS = ['Inter', 'Arial', 'Verdana', 'Georgia', 'Trebuchet MS', 'Times New Roman'];

// ---------- Configuraciones por defecto ----------
export const DEFAULT_SETTINGS = {
  language: 'es',
  showProgress: false,
  scrollTop: false,
  saveProgress: false,
  badge: true,
  partialSubmissions: false,
  allowedSites: '',
  welcome: { enabled: false, title: 'Bienvenido', text: '', button: 'Comenzar' },
  mailMe: { enabled: false },
  mailRespondent: { enabled: false, fieldKey: '', subject: '', body: '', attachPdf: false },
  smtp: 'platform', // platform | workspace | custom
  button: { text: 'Enviar', sendingText: 'Enviando…', icon: 'none', iconPos: 'left', style: 'filled', color: '#1d8239', size: 'medium', width: 'auto', align: 'left' },
  conditions: [], // { id, action: show|hide|fill, target, source, operator, value, fillValue }
  linkPreview: { title: '', description: '', image: '', favicon: '' },
  reference: { prefix: 'REF', suffix: '', start: 1, length: 4 },
  quiz: { enabled: false, showScore: true, showAnswers: false, grades: [{ id: 'g1', min: 0, label: 'Reprobado', feedback: '' }, { id: 'g2', min: 60, label: 'Aprobado', feedback: '' }] },
  timer: { enabled: false, minutes: 10, onEnd: 'submit', warnAt: 1 },
  pdf: { enabled: false, template: 'simple' },
};

const merge = (base, over) => {
  if (Array.isArray(base)) return Array.isArray(over) ? over : base;
  if (base && typeof base === 'object') {
    const out = { ...base };
    Object.keys(over || {}).forEach((k) => {
      out[k] = k in base ? merge(base[k], over[k]) : over[k];
    });
    return out;
  }
  return over === undefined ? base : over;
};
export const mergeDesign = (d) => merge(DEFAULT_DESIGN, d || {});
export const mergeSettings = (s) => merge(DEFAULT_SETTINGS, s || {});

// ---------- Campos ----------
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'campo';

export function uniqueKey(label, fields, ownCid) {
  const base = slug(label);
  let key = base;
  let n = 2;
  while (fields.some((f) => f.field_key === key && f.cid !== ownCid)) {
    key = `${base}_${n}`;
    n += 1;
  }
  return key;
}

export function createField(item, fields) {
  const label = item.label;
  const f = {
    cid: newCid(),
    field_type: item.type,
    label,
    field_key: uniqueKey(label, fields),
    placeholder: '',
    help_text: '',
    is_required: false,
    width: 'full',
    custom_attributes_json: item.ui ? { ui_kind: item.ui } : {},
  };
  if (HAS_OPTIONS.includes(item.type)) {
    f.options_json = [
      { label: 'Opción 1', value: 'opcion_1' },
      { label: 'Opción 2', value: 'opcion_2' },
    ];
  }
  if (item.type === 'rating') f.max_value = 5;
  if (item.type === 'heading') f.label = 'Título de sección';
  if (item.type === 'paragraph') f.label = 'Escribe aquí un texto explicativo.';
  if (item.ui === 'audio') f.allowed_file_types = 'audio/mpeg,audio/wav,audio/webm';
  if (item.type === 'image') f.allowed_file_types = 'image/png,image/jpeg,image/webp';
  return f;
}

export const fromApiField = (f) => ({ ...f, cid: `s${f.id}`, options_json: f.options_json || undefined, custom_attributes_json: f.custom_attributes_json || {} });

export const itemOf = (field) => findItem(field.field_type, field.custom_attributes_json?.ui_kind);

// Reglas de condiciones -> conditional_logic_json por campo (el backend las reevalúa).
export function compileConditions(fields, conditions) {
  return fields.map((f) => {
    const rules = conditions.filter((c) => c.target === f.field_key && (c.action === 'show' || c.action === 'hide') && c.source);
    if (!rules.length) return { ...f, conditional_logic_json: null };
    const action = rules[0].action;
    return {
      ...f,
      conditional_logic_json: {
        action,
        logic: 'all',
        rules: rules.filter((r) => r.action === action).map((r) => ({ field_key: r.source, operator: r.operator, value: r.value })),
      },
    };
  });
}

// ---------- Estilo del lienzo (variables CSS) ----------
export function bgCss(bg) {
  if (!bg) return {};
  if (bg.type === 'gradient') return { background: `linear-gradient(${bg.direction}, ${bg.from}, ${bg.to})` };
  if (bg.type === 'image' && bg.image) return { background: `center / cover no-repeat url("${bg.image}")` };
  if (bg.type === 'transparent') return { background: 'transparent' };
  return { background: bg.color };
}

const hex = (h) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(h || '');
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lum = ([r, g, b]) => {
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
export function contrast(a, b) {
  const x = hex(a);
  const y = hex(b);
  if (!x || !y) return null;
  const [l1, l2] = [lum(x), lum(y)].sort((p, q) => q - p);
  return (l1 + 0.05) / (l2 + 0.05);
}
