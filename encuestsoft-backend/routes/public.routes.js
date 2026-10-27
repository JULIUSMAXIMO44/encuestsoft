const router = require('express').Router();
const upload = require('../config/multer');
const { publicSubmitLimiter } = require('../middleware/rateLimiter');
const { loadPublicForm } = require('../middleware/loadPublicForm');
const { verifyRecaptcha } = require('../middleware/recaptcha');
const ctrl = require('../controllers/publicController');

// GET del schema público de un formulario (para el frontend React embebido o standalone)
router.get('/forms/:formUuid', loadPublicForm, ctrl.getPublicForm);

// Envío del formulario: soporta multipart/form-data (archivos) o JSON.
router.post(
  '/forms/:formUuid/submit',
  publicSubmitLimiter,
  (req, res, next) => {
    // upload.any() acepta cualquier nombre de campo de archivo definido por el builder drag&drop
    upload.any()(req, res, (err) => (err ? next(err) : next()));
  },
  loadPublicForm,
  verifyRecaptcha,
  ctrl.submitPublicForm
);

module.exports = router;
