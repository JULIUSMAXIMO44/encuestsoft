const { customAlphabet } = require('nanoid');

const nanoidNumeric = customAlphabet('0123456789', 6);

/**
 * Genera un ID de referencia único para un envío de formulario,
 * según el formato configurado en el formulario.
 * Soporta placeholders: {PREFIX}, {YEAR}, {MONTH}, {DAY}, {SEQ}, {RANDOM}
 *
 * @param {object} form - instancia de Form (con reference_id_prefix y reference_id_format)
 * @param {number} sequence - número secuencial de envíos + 1 (para {SEQ})
 */
function generateReferenceId(form, sequence = 1) {
  const now = new Date();
  const format = form.reference_id_format || '{PREFIX}-{YEAR}-{SEQ}';
  const prefix = form.reference_id_prefix || 'REF';

  return format
    .replace('{PREFIX}', prefix)
    .replace('{YEAR}', String(now.getFullYear()))
    .replace('{MONTH}', String(now.getMonth() + 1).padStart(2, '0'))
    .replace('{DAY}', String(now.getDate()).padStart(2, '0'))
    .replace('{SEQ}', String(sequence).padStart(5, '0'))
    .replace('{RANDOM}', nanoidNumeric());
}

module.exports = { generateReferenceId };
