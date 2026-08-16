const router = require('express').Router();
const { listEmails, retryEmail, deleteEmail } = require('../controllers/emailController');

router.get('/', listEmails);
router.post('/:jobId/retry', retryEmail);
router.delete('/:jobId', deleteEmail);

module.exports = router;