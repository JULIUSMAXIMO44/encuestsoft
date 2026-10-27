const logger = require('../utils/logger');

function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.originalUrl });

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ success: false, message: 'El recurso ya existe (violación de unicidad).' });
  }
  if (err.name === 'SequelizeValidationError') {
    return res.status(422).json({
      success: false,
      message: 'Error de validación de datos.',
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: `Error al subir archivo: ${err.message}` });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Error interno del servidor.' : err.message,
    ...(err.errors ? { errors: err.errors } : {}),
  });
}

module.exports = { notFound, errorHandler };
