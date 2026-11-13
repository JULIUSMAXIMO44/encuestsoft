// Catálogo de elementos del constructor, por categorías (panel izquierdo).
// `type` es el field_type que entiende el backend; `ui` distingue variantes
// (tomar foto y grabadora usan los tipos image y file con un atributo extra).
export const CATEGORIES = [
  {
    id: 'basicos',
    label: 'Campos básicos',
    items: [
      { type: 'text', label: 'Texto corto', icon: 'T' },
      { type: 'textarea', label: 'Texto largo', icon: '¶' },
      { type: 'email', label: 'Correo electrónico', icon: '@' },
      { type: 'phone', label: 'Teléfono', icon: '☎' },
      { type: 'number', label: 'Número', icon: '#' },
      { type: 'password', label: 'Contraseña', icon: '••' },
      { type: 'address', label: 'Dirección', icon: '⌂' },
      { type: 'date', label: 'Fecha', icon: '▦' },
      { type: 'time', label: 'Hora', icon: '◔' },
      { type: 'datetime', label: 'Fecha y hora', icon: '▤' },
    ],
  },
  {
    id: 'seleccion',
    label: 'Selección',
    items: [
      { type: 'select', label: 'Lista desplegable', icon: '▾' },
      { type: 'multiselect', label: 'Selección múltiple', icon: '☰' },
      { type: 'radio', label: 'Opción única', icon: '◉' },
      { type: 'checkbox', label: 'Casillas', icon: '☑' },
      { type: 'rating', label: 'Calificación', icon: '★' },
    ],
  },
  {
    id: 'archivos',
    label: 'Archivos y firmas',
    items: [
      { type: 'file', label: 'Subir archivo', icon: '⇪' },
      { type: 'image', label: 'Subir imagen', icon: '▣' },
      { type: 'signature', label: 'Firma', icon: '✎' },
      { type: 'image', ui: 'camera', label: 'Tomar foto', icon: '◎' },
      { type: 'file', ui: 'audio', label: 'Grabadora de voz', icon: '●' },
    ],
  },
  {
    id: 'estructura',
    label: 'Estructura y seguridad',
    items: [
      { type: 'heading', label: 'Encabezado', icon: 'H' },
      { type: 'paragraph', label: 'Párrafo', icon: '≡' },
      { type: 'divider', label: 'Divisor', icon: '―' },
      { type: 'hidden', label: 'Campo oculto', icon: '◌' },
      { type: 'recaptcha', label: 'reCAPTCHA', icon: '✓' },
    ],
  },
];

export const ALL_ITEMS = CATEGORIES.flatMap((c) => c.items);
export const itemKey = (it) => `${it.type}${it.ui ? `:${it.ui}` : ''}`;
export const findItem = (type, ui) => ALL_ITEMS.find((i) => i.type === type && (i.ui || '') === (ui || '')) || ALL_ITEMS.find((i) => i.type === type);

export const HAS_OPTIONS = ['select', 'multiselect', 'radio', 'checkbox'];
export const NO_INPUT = ['heading', 'paragraph', 'divider', 'recaptcha'];
export const TEXTUAL = ['text', 'textarea', 'email', 'phone', 'password', 'address'];
export const FILE_TYPES = ['file', 'image', 'signature'];

export const OPERATORS = [
  ['equals', 'es igual a'],
  ['not_equals', 'no es igual a'],
  ['contains', 'contiene'],
  ['not_contains', 'no contiene'],
  ['greater_than', 'es mayor que'],
  ['less_than', 'es menor que'],
  ['is_empty', 'está vacío'],
  ['is_not_empty', 'no está vacío'],
];
