/**
 * Envuelve controladores async para propagar errores al errorHandler
 * central sin necesidad de try/catch repetido en cada controlador.
 */
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
