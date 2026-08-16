const { emailQueue, getQueueStats } = require('../queues/emailQueue');
const Enquiry = require('../models/Enquiry');
const EmailLog = require('../models/EmailLog');

// GET /api/queue/stats — live BullMQ counters + document counts.
async function getStats(req, res, next) {
  try {
    const [queueStats, emailCounts, enquiryCount] = await Promise.all([
      getQueueStats(),
      EmailLog.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Enquiry.countDocuments(),
    ]);

    const counts = { pending: 0, queued: 0, processing: 0, sent: 0, failed: 0 };
    emailCounts.forEach((row) => {
      counts[row._id] = row.count;
    });

    res.json({
      success: true,
      data: {
        queue: {
          name: 'emailQueue',
          waiting: queueStats.waiting,
          active: queueStats.active,
          completed: queueStats.completed,
          failed: queueStats.failed,
          delayed: queueStats.delayed,
        },
        emails: counts,
        enquiries: { total: enquiryCount },
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/queue/jobs — most recent jobs directly from Redis.
async function getRecentJobs(req, res, next) {
  try {
    const jobs = await emailQueue.getJobs(
      ['waiting', 'active', 'completed', 'failed', 'delayed'],
      0,
      20
    );
    const data = await Promise.all(
      jobs.map(async (job) => ({
        id: job.id,
        name: job.name,
        type: job.data.emailType || 'unknown',
        to: job.data.recipient || 'unknown',
        state: await job.getState(),
        attemptsMade: job.attemptsMade,
        attempts: job.opts.attempts,
        createdAt: job.timestamp,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
      }))
    );
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, getRecentJobs };