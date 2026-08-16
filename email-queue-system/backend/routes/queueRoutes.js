const router = require('express').Router();
const { getStats, getRecentJobs } = require('../controllers/queueController');

router.get('/stats', getStats);
router.get('/jobs', getRecentJobs);

module.exports = router;