const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/forms', require('./form.routes'));
router.use('/forms/:formId/submissions', require('./submission.routes'));
router.use('/forms/:formId/reports', require('./report.routes'));
router.use('/forms/:formId/webhooks', require('./webhook.routes'));
router.use('/forms/:formId/integrations', require('./integration.routes'));
router.use('/public', require('./public.routes'));

router.get('/health', (req, res) => res.json({ success: true, message: 'ENCUESTSOFT API operativa.', timestamp: new Date() }));

module.exports = router;
