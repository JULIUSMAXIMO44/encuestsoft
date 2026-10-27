/**
 * Validación de respuestas en el cliente (misma lógica que el backend `fieldValidator`),
 * para dar retroalimentación inmediata y específica al usuario.
 */
import { isFieldVisible } from './conditionalLogic.js';

const DECORATIVE = ['heading', 'paragraph', 'divider'];

/** Valida un campo; devuelve el mensaje de error o '' si es válido. */
export function validateField(field, value) {
  const isFile = field.field_type === 'file' || field.field_type === 'image';
  const empty = isFile ? !value || !value.length : value === undefined || value === null || (Array.isArray(value) ? !value.length : String(value).trim() === '');
  if (field.is_required && empty) return field.validation_message || `${field.label} es obligatorio.`;
  if (empty) return '';
  const text = String(value);
  switch (field.field_type) {
    case 'email': if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return 'Ingrese un correo electrónico válido, por ejemplo nombre@dominio.com.'; break;
    case 'phone': if (!/^[0-9+()\-\s]{6,20}$/.test(text)) return 'Ingrese un número de teléfono válido.'; break;
    case 'number':
    case 'rating': {
      const n = parseFloat(text);
      if (Number.isNaN(n)) return 'Debe ser un valor numérico.';
      if (field.min_value != null && n < parseFloat(field.min_value)) return `El valor mínimo permitido es ${parseFloat(field.min_value)}.`;
      if (field.max_value != null && n > parseFloat(field.max_value)) return `El valor máximo permitido es ${parseFloat(field.max_value)}.`;
      break;
    }
    default: break;
  }
  if (typeof value === 'string') {
    if (field.min_length && value.length < field.min_length) return `Debe tener al menos ${field.min_length} caracteres.`;
    if (field.max_length && value.length > field.max_length) return `No debe superar ${field.max_length} caracteres.`;
  }
  if (field.regex_pattern && typeof value === 'string') {
    try { if (!new RegExp(field.regex_pattern).test(value)) return field.validation_message || 'El formato no es válido.'; } catch { /* patrón inválido: se ignora */ }
  }
  if (isFile) {
    const maxBytes = (field.max_file_size_mb || 10) * 1024 * 1024;
    const allowed = (field.allowed_file_types || '').split(',').map((t) => t.trim()).filter(Boolean);
    if (value.length > (field.max_files || 1)) return `Máximo ${field.max_files || 1} archivo(s).`;
    for (const f of Array.from(value)) {
      if (allowed.length && !allowed.includes(f.type)) return `Tipo de archivo no permitido: ${f.type || 'desconocido'}.`;
      if (f.size > maxBytes) return `El archivo supera el máximo de ${field.max_file_size_mb || 10} MB.`;
    }
  }
  return '';
}

/** Valida los campos visibles (opcionalmente solo los de un paso). @returns {Object<string,string>} errores por field_key */
export function validateAll(fields, answers, step) {
  const errors = {};
  fields.forEach((f) => {
    if (DECORATIVE.includes(f.field_type)) return;
    if (step && (f.step_number || 1) !== step) return;
    if (!isFieldVisible(f.conditional_logic_json, answers)) return;
    const msg = validateField(f, answers[f.field_key]);
    if (msg) errors[f.field_key] = msg;
  });
  return errors;
}
