const router = require('express').Router({ mergeParams: true });
const { authenticate, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/submissionController');

router.use(authenticate);

router.get('/', ctrl.listSubmissions);
router.get('/export', ctrl.exportSubmissions);
router.get('/:id', ctrl.getSubmission);
router.get('/:id/pdf', ctrl.downloadSubmissionPdf);
router.delete('/:id', authorize('owner', 'admin', 'editor'), ctrl.deleteSubmission);

module.exports = router;
