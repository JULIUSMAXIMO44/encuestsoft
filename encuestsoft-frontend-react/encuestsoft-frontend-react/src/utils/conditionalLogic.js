/**
 * Evaluación de lógica condicional en el cliente. Replica `utils/conditionalLogic.js`
 * del backend (que vuelve a validar en el servidor) para mostrar u ocultar campos en vivo.
 */
function compare(operator, actual, expected) {
  const a = actual ?? '';
  switch (operator) {
    case 'equals': return String(a) === String(expected);
    case 'not_equals': return String(a) !== String(expected);
    case 'contains': return String(Array.isArray(a) ? a.join(',') : a).toLowerCase().includes(String(expected).toLowerCase());
    case 'not_contains': return !String(Array.isArray(a) ? a.join(',') : a).toLowerCase().includes(String(expected).toLowerCase());
    case 'greater_than': return parseFloat(a) > parseFloat(expected);
    case 'less_than': return parseFloat(a) < parseFloat(expected);
    case 'is_empty': return a === '' || (Array.isArray(a) && !a.length);
    case 'is_not_empty': return !(a === '' || (Array.isArray(a) && !a.length));
    default: return true;
  }
}

/** @returns {boolean} true si el campo debe mostrarse con las respuestas actuales. */
export function isFieldVisible(logic, answers) {
  if (!logic || !Array.isArray(logic.rules) || !logic.rules.length) return true;
  const { logic: mode = 'all', rules, action = 'show' } = logic;
  const results = rules.map((r) => compare(r.operator, answers[r.field_key], r.value));
  const matched = mode === 'any' ? results.some(Boolean) : results.every(Boolean);
  return action === 'hide' ? !matched : matched;
}
