/**
 * Helpers para respuestas HTTP consistentes en toda la API.
 */
function ok(res, data = null, message = 'OK', status = 200, meta) {
  const payload = { success: true, message, data };
  if (meta) payload.meta = meta;
  return res.status(status).json(payload);
}

function created(res, data, message = 'Recurso creado correctamente.') {
  return ok(res, data, message, 201);
}

function fail(res, message = 'Ocurrió un error.', status = 400, errors) {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(status).json(payload);
}

class ApiError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { ok, created, fail, ApiError };
