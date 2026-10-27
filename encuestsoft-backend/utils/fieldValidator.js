const { isFieldVisible } = require('./conditionalLogic');

/**
 * Valida en el servidor las respuestas de un envío contra la definición
 * de campos del formulario (drag & drop schema), respetando campos
 * condicionales, tipos, requeridos, longitudes, rangos y regex.
 *
 * @param {Array} fields - instancias FormField ordenadas por position
 * @param {object} answersByKey - { field_key: value } enviado por el cliente
 * @param {object} filesByFieldKey - { field_key: [multer files] }
 * @returns {{ valid: boolean, errors: Array<{field:string, message:string}> }}
 */
function validateSubmission(fields, answersByKey, filesByFieldKey = {}) {
  const errors = [];

  for (const field of fields) {
    if (!field.is_active) continue;
    if (['heading', 'paragraph', 'divider'].includes(field.field_type)) continue;

    const visible = isFieldVisible(field.conditional_logic_json, answersByKey);
    if (!visible) continue; // no se valida ni se guarda un campo oculto por lógica condicional

    const value = answersByKey[field.field_key];
    const files = filesByFieldKey[field.field_key] || [];
    const hasValue = field.field_type === 'file' || field.field_type === 'image'
      ? files.length > 0
      : value !== undefined && value !== null && String(value).trim() !== '';

    if (field.is_required && !hasValue) {
      errors.push({ field: field.field_key, message: field.validation_message || `${field.label} es obligatorio.` });
      continue;
    }
    if (!hasValue) continue;

    switch (field.field_type) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push({ field: field.field_key, message: 'Correo electrónico inválido.' });
        }
        break;
      case 'number':
      case 'rating': {
        const num = parseFloat(value);
        if (Number.isNaN(num)) {
          errors.push({ field: field.field_key, message: 'Debe ser un valor numérico.' });
        } else {
          if (field.min_value != null && num < parseFloat(field.min_value)) {
            errors.push({ field: field.field_key, message: `El valor mínimo permitido es ${field.min_value}.` });
          }
          if (field.max_value != null && num > parseFloat(field.max_value)) {
            errors.push({ field: field.field_key, message: `El valor máximo permitido es ${field.max_value}.` });
          }
        }
        break;
      }
      case 'phone':
        if (!/^[0-9+()\-\s]{6,20}$/.test(value)) {
          errors.push({ field: field.field_key, message: 'Número de teléfono inválido.' });
        }
        break;
      default:
        break;
    }

    if (typeof value === 'string') {
      if (field.min_length && value.length < field.min_length) {
        errors.push({ field: field.field_key, message: `Debe tener al menos ${field.min_length} caracteres.` });
      }
      if (field.max_length && value.length > field.max_length) {
        errors.push({ field: field.field_key, message: `No debe superar ${field.max_length} caracteres.` });
      }
    }
    if (field.regex_pattern) {
      try {
        const re = new RegExp(field.regex_pattern);
        if (!re.test(value)) {
          errors.push({ field: field.field_key, message: field.validation_message || 'Formato inválido.' });
        }
      } catch { /* patrón inválido guardado: se ignora silenciosamente */ }
    }

    // Archivos: tipo y tamaño
    if ((field.field_type === 'file' || field.field_type === 'image') && files.length) {
      const allowed = (field.allowed_file_types || '').split(',').map((t) => t.trim()).filter(Boolean);
      const maxBytes = (field.max_file_size_mb || 10) * 1024 * 1024;
      if (files.length > (field.max_files || 1)) {
        errors.push({ field: field.field_key, message: `Máximo ${field.max_files || 1} archivo(s) permitido(s).` });
      }
      for (const f of files) {
        if (allowed.length && !allowed.includes(f.mimetype)) {
          errors.push({ field: field.field_key, message: `Tipo de archivo no permitido: ${f.mimetype}` });
        }
        if (f.size > maxBytes) {
          errors.push({ field: field.field_key, message: `El archivo supera el tamaño máximo de ${field.max_file_size_mb}MB.` });
        }
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validateSubmission };
