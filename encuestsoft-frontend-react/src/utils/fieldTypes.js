/**
 * Catálogo de tipos de campo del constructor (alineado con el ENUM `field_type` del backend).
 */
export const FIELD_TYPES = [
  { type: 'text', label: 'Texto corto', icon: 'bi-input-cursor-text', group: 'Entrada' },
  { type: 'textarea', label: 'Párrafo', icon: 'bi-text-paragraph', group: 'Entrada' },
  { type: 'email', label: 'Correo electrónico', icon: 'bi-envelope', group: 'Entrada' },
  { type: 'phone', label: 'Teléfono', icon: 'bi-telephone', group: 'Entrada' },
  { type: 'number', label: 'Número', icon: 'bi-123', group: 'Entrada' },
  { type: 'date', label: 'Fecha', icon: 'bi-calendar-event', group: 'Entrada' },
  { type: 'time', label: 'Hora', icon: 'bi-clock', group: 'Entrada' },
  { type: 'radio', label: 'Opción única', icon: 'bi-record-circle', group: 'Selección', hasOptions: true },
  { type: 'checkbox', label: 'Opción múltiple', icon: 'bi-check2-square', group: 'Selección', hasOptions: true },
  { type: 'select', label: 'Lista desplegable', icon: 'bi-menu-button-wide', group: 'Selección', hasOptions: true },
  { type: 'rating', label: 'Calificación (1-5)', icon: 'bi-star', group: 'Selección' },
  { type: 'file', label: 'Archivo adjunto', icon: 'bi-paperclip', group: 'Otros' },
  { type: 'heading', label: 'Título de sección', icon: 'bi-type-h2', group: 'Diseño', decorative: true },
  { type: 'paragraph', label: 'Texto informativo', icon: 'bi-card-text', group: 'Diseño', decorative: true },
  { type: 'divider', label: 'Separador', icon: 'bi-dash-lg', group: 'Diseño', decorative: true },
];

export const getFieldType = (type) => FIELD_TYPES.find((t) => t.type === type) || { type, label: type, icon: 'bi-question-square' };

/** Tipos que se renderizan como lista de opciones. */
export const OPTION_TYPES = ['radio', 'checkbox', 'select', 'multiselect'];

/** Normaliza `options_json` (acepta ["a"] o [{label,value}]) a [{label,value}]. */
export function normalizeOptions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((o) => (typeof o === 'string' ? { label: o, value: o } : { label: o.label ?? String(o.value ?? ''), value: o.value ?? o.label }))
    .filter((o) => o.label !== '');
}

/** Genera una clave técnica única (`field_key`) a partir de la etiqueta. */
export function makeFieldKey(label, existingKeys = []) {
  const base =
    label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 40) || 'campo';
  let key = base;
  let i = 2;
  while (existingKeys.includes(key)) key = `${base}_${i++}`;
  return key;
}
