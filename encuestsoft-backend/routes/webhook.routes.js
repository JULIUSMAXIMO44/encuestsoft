const router = require('express').Router({ mergeParams: true });
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/webhookController');

router.use(authenticate, authorize('owner', 'admin', 'editor'));

router.get('/', ctrl.listWebhooks);
router.post('/', ctrl.createWebhook);
router.patch('/:id', ctrl.updateWebhook);
router.delete('/:id', ctrl.deleteWebhook);

module.exports = router;
