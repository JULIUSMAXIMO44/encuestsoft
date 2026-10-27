require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const routes = require('./routes');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// ---- Seguridad y usabilidad de red ----
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } })); // permite servir /uploads a un frontend en otro origen
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

const allowedOrigins = (process.env.CORS_ORIGINS || '*').split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origen no permitido por CORS.'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Archivos subidos (imágenes/documentos de campos "file"/"image") servidos estáticamente
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

app.use(process.env.API_PREFIX || '/api/v1', apiLimiter, routes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'ENCUESTSOFT API — Generador de formularios y encuestas.', docs: '/api/v1/health' });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
