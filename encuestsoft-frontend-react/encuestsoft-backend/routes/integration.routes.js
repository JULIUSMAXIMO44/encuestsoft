const router = require('express').Router({ mergeParams: true });
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/integrationController');

router.use(authenticate, authorize('owner', 'admin', 'editor'));

router.get('/', ctrl.listIntegrations);
router.post('/', ctrl.createIntegration);
router.patch('/:id', ctrl.updateIntegration);
router.delete('/:id', ctrl.deleteIntegration);

module.exports = router;
