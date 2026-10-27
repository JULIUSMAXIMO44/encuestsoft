/** Funciones auxiliares generales. */

/** Genera un identificador único corto (usado como clave temporal de React en el constructor). */
export const uid = (prefix = 'id') => `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
