/**
 * Motor de evaluación de "campos condicionales" en el servidor.
 * El schema conditional_logic_json de un FormField tiene la forma:
 * {
 *   "action": "show" | "hide",
 *   "logic": "all" | "any",
 *   "rules": [{ "field_key": "pais", "operator": "equals", "value": "CO" }, ...]
 * }
 * Se reevalúa en el backend (no solo en el frontend React) para que un envío
 * no pueda forzar el guardado de un campo que debía permanecer oculto,
 * y para excluir del reporte estadístico las respuestas de campos no aplicables.
 */

function compare(operator, actual, expected) {
  switch (operator) {
    case 'equals':
      return String(actual) === String(expected);
    case 'not_equals':
      return String(actual) !== String(expected);
    case 'contains':
      return String(actual || '').toLowerCase().includes(String(expected).toLowerCase());
    case 'not_contains':
      return !String(actual || '').toLowerCase().includes(String(expected).toLowerCase());
    case 'greater_than':
      return parseFloat(actual) > parseFloat(expected);
    case 'less_than':
      return parseFloat(actual) < parseFloat(expected);
    case 'is_empty':
      return actual === undefined || actual === null || actual === '';
    case 'is_not_empty':
      return !(actual === undefined || actual === null || actual === '');
    default:
      return true;
  }
}

/**
 * @param {object} conditionalLogic - conditional_logic_json del campo
 * @param {object} answersByKey - respuestas ya enviadas { field_key: value }
 * @returns {boolean} true si el campo debe estar visible/aplicable
 */
function isFieldVisible(conditionalLogic, answersByKey) {
  if (!conditionalLogic || !Array.isArray(conditionalLogic.rules) || !conditionalLogic.rules.length) {
    return true; // sin lógica condicional => siempre visible
  }
  const { logic = 'all', rules, action = 'show' } = conditionalLogic;
  const results = rules.map((r) => compare(r.operator, answersByKey[r.field_key], r.value));
  const matched = logic === 'any' ? results.some(Boolean) : results.every(Boolean);
  // Si la acción es "show", el campo es visible cuando matched es true.
  // Si la acción es "hide", el campo es visible cuando matched es false.
  return action === 'hide' ? !matched : matched;
}

module.exports = { isFieldVisible, compare };
