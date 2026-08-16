const EmailLog = require('../models/EmailLog');
const { retryJob, removeJob } = require('../queues/emailQueue');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const PAGE_SIZE = 10;
const VALID_STATUSES = ['pending', 'queued', 'processing', 'sent', 'failed'];

// GET /api/emails?status=sent&page=1&limit=10
async function listEmails(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || PAGE_SIZE);
    const status = req.query.status;

    const filter = {};
    if (status && VALID_STATUSES.includes(status)) filter.status = status;

    const [total, emails] = await Promise.all([
      EmailLog.countDocuments(filter),
      EmailLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('enquiryId', 'fullName email phone subject bookingDate guests'),
    ]);

    const counts = {};
    for (const s of VALID_STATUSES) {
      counts[s] = await EmailLog.countDocuments({ status: s });
    }

    res.json({
      success: true,
      data: emails,
      counts,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/emails/:jobId/retry — re-queue a permanently failed job.
async function retryEmail(req, res, next) {
  try {
    const log = await EmailLog.findOne({ queueJobId: req.params.jobId });
    if (!log) throw new AppError('Email log not found', 404);

    if (log.status !== 'failed') {
      throw new AppError(`Only failed emails can be retried (current status: ${log.status})`, 400);
    }

    const job = await retryJob(req.params.jobId);
    if (!job) throw new AppError('Original queue job not found', 404);

    await log.updateOne({
      queueJobId: job.id,
      status: 'queued',
      attempts: 0,
      error: null,
      sentAt: null,
      processedAt: null,
    });

    logger.info(`[API] Retry scheduled for job ${req.params.jobId} → new job ${job.id}`);
    res.json({
      success: true,
      message: 'Email has been re-queued for delivery.',
      data: { jobId: job.id },
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/emails/:jobId
async function deleteEmail(req, res, next) {
  try {
    const log = await EmailLog.findOne({ queueJobId: req.params.jobId });
    if (!log) throw new AppError('Email log not found', 404);

    await removeJob(req.params.jobId).catch(() => {});
    await log.deleteOne();

    logger.info(`[API] Email log deleted job=${req.params.jobId}`);
    res.json({ success: true, message: 'Email log deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listEmails, retryEmail, deleteEmail };