const router = require('express').Router({ mergeParams: true });
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/reportController');

router.use(authenticate);

router.get('/general', ctrl.generalReport);
router.get('/fields', ctrl.fieldReport);

module.exports = router;
