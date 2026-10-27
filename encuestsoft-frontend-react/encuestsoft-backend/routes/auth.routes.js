const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post(
  '/register',
  [
    body('organization_name').notEmpty().withMessage('El nombre de la organización es obligatorio.'),
    body('full_name').notEmpty().withMessage('El nombre completo es obligatorio.'),
    body('email').isEmail().withMessage('Correo inválido.'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
  ],
  validate,
  ctrl.register
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  validate,
  ctrl.login
);

router.post('/refresh', ctrl.refresh);
router.get('/me', authenticate, ctrl.me);
router.patch('/me/accessibility', authenticate, ctrl.updateA11yPreferences);

module.exports = router;
