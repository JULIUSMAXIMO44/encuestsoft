const router = require('express').Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/formController');

router.use(authenticate);

router.get('/', ctrl.listForms);
router.post('/', [body('title').notEmpty().withMessage('El título es obligatorio.')], validate, ctrl.createForm);
router.get('/:id', ctrl.getForm);
router.patch('/:id', authorize('owner', 'admin', 'editor'), ctrl.updateForm);
router.delete('/:id', authorize('owner', 'admin'), ctrl.deleteForm);
router.post('/:id/duplicate', authorize('owner', 'admin', 'editor'), ctrl.duplicateForm);
router.patch('/:id/status', authorize('owner', 'admin', 'editor'), ctrl.setFormStatus);
router.patch('/:id/password', authorize('owner', 'admin', 'editor'), ctrl.setFormPassword);
router.put('/:id/fields', authorize('owner', 'admin', 'editor'), ctrl.saveFormFields);
router.get('/:id/embed', ctrl.getEmbedCode);

module.exports = router;
