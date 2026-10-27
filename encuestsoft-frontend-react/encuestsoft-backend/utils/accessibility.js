/**
 * Utilidades de Accesibilidad (WCAG 2.1 AA) y Usabilidad.
 * Enriquecen cada campo con los atributos que el frontend React (con hooks)
 * necesita renderizar directamente en el DOM, sin lógica adicional en el cliente.
 */

/**
 * Construye el bloque de atributos accesibles de un campo, listo para usarse
 * como props en un componente React: <input {...field.a11y} />
 */
function buildA11yAttributes(field) {
  const describedByIds = [];
  if (field.help_text) describedByIds.push(`${field.field_key}-help`);
  if (field.validation_message) describedByIds.push(`${field.field_key}-error`);

  return {
    id: field.field_key,
    name: field.field_key,
    'aria-label': field.aria_label || field.label,
    'aria-required': !!field.is_required,
    'aria-describedby': describedByIds.length ? describedByIds.join(' ') : undefined,
    'aria-invalid': false, // el frontend lo recalcula en validación runtime
    autoComplete: field.autocomplete_attr || 'off',
    tabIndex: 0,
  };
}

/**
 * Sugerencia automática de atributo `autocomplete` HTML según el tipo/etiqueta
 * del campo, para mejorar usabilidad (autocompletado del navegador).
 */
function suggestAutocomplete(fieldType, fieldKey = '') {
  const key = fieldKey.toLowerCase();
  const map = {
    email: 'email',
    phone: 'tel',
    password: 'new-password',
    date: 'bday',
    address: 'street-address',
  };
  if (map[fieldType]) return map[fieldType];
  if (key.includes('nombre') || key.includes('name')) return 'name';
  if (key.includes('correo') || key.includes('mail')) return 'email';
  return 'off';
}

/**
 * Valida contraste mínimo entre color de texto y fondo (regla WCAG AA simplificada,
 * ratio aproximado por luminancia relativa). Usado al guardar style_json de un formulario.
 */
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean, 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Devuelve advertencias de accesibilidad para el diseño de un formulario
 * (colores insuficientes en contraste, etc.) sin bloquear el guardado.
 */
function checkStyleAccessibility(styleJson = {}) {
  const warnings = [];
  if (styleJson.textColor && styleJson.backgroundColor) {
    const ratio = contrastRatio(styleJson.textColor, styleJson.backgroundColor);
    if (ratio < 4.5) {
      warnings.push(
        `Contraste texto/fondo ${ratio.toFixed(2)}:1 por debajo del mínimo WCAG AA (4.5:1).`
      );
    }
  }
  return warnings;
}

module.exports = {
  buildA11yAttributes,
  suggestAutocomplete,
  checkStyleAccessibility,
  contrastRatio,
};
