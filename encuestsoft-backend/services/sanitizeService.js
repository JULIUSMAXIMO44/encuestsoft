const sanitizeHtml = require('sanitize-html');

/**
 * Limpia entradas de texto libre para prevenir XSS almacenado, conservando
 * texto plano (los formularios no requieren HTML enriquecido en respuestas).
 */
function sanitizeAnswers(answersByKey) {
  const clean = {};
  for (const [key, value] of Object.entries(answersByKey || {})) {
    if (Array.isArray(value)) {
      clean[key] = value.map((v) => (typeof v === 'string' ? sanitizeHtml(v, { allowedTags: [], allowedAttributes: {} }) : v));
    } else if (typeof value === 'string') {
      clean[key] = sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

module.exports = { sanitizeAnswers };
