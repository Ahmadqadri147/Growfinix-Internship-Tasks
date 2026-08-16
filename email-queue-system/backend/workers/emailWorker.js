const EmailLog = require('../models/EmailLog');
const customerConfirmation = require('../templates/customerConfirmation');
const adminNotification = require('../templates/adminNotification');
const { QUEUE_NAME, emailQueue } = require('../queues/emailQueue');
const { sendEmail, isSmtpConfigured } = require('../services/emailService');
const logger = require('../utils/logger');

const EMAIL_SUBJECTS = {
  customer_confirmation: 'Your enquiry has been received',
  admin_notification: 'New enquiry received — action required',
};

function renderTemplate(emailType, enquiry) {
  return emailType === 'admin_notification'
    ? adminNotification(enquiry)
    : customerConfirmation(enquiry);
}

function subjectFor(emailType, enquiry) {
  if (emailType === 'admin_notification') return `${EMAIL_SUBJECTS.admin_notification} — ${enquiry.fullName}`;
  return EMAIL_SUBJECTS.customer_confirmation;
}

// Processor — one BullMQ job = one email. Throwing here lets BullMQ
// run its retry/backoff policy and eventually marks the job failed.
async function processEmailJob(job) {
  const { emailLogId, emailType, enquiry } = job.data;

  logger.info(`[WORKER] Processing job id=${job.id} type=${emailType} attempt=${job.attemptsMade + 1}`);

  const log = await EmailLog.findById(emailLogId);
  if (!log) {
    throw new Error(`EmailLog ${emailLogId} not found — dropping job`);
  }

  await log.updateOne({
    status: 'processing',
    attempts: job.attemptsMade + 1,
    processedAt: new Date(),
    error: null,
  });

  const html = renderTemplate(emailType, enquiry);
  const subject = subjectFor(emailType, enquiry);

  await sendEmail({
    to: job.data.recipient,
    subject,
    html,
  });

  await log.updateOne({
    status: 'sent',
    sentAt: new Date(),
    error: null,
  });

  logger.success(`[WORKER] Job ${job.id} completed → email sent to ${job.data.recipient}`);
  return { ok: true, emailLogId };
}

function createWorker(connection) {
  const { Worker } = require('bullmq');
  const worker = new Worker(QUEUE_NAME, processEmailJob, {
    connection,
    concurrency: 5,
  });

  worker.on('completed', (job) => {
    logger.success(`[WORKER] Job completed id=${job.id}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`[WORKER] Email failed id=${job?.id} error=${err.message}`);
    const attemptsExhausted = job && job.attemptsMade >= job.opts.attempts;
    if (job && !attemptsExhausted) {
      // Back to queued — BullMQ is scheduling the next attempt.
      EmailLog.updateOne(
        { queueJobId: job.id },
        { status: 'queued', error: err.message.slice(0, 500) }
      ).catch(() => {});
      logger.warn(`[QUEUE] Retrying job id=${job.id} (attempt ${job.attemptsMade}/${job.opts.attempts})`);
    }
    if (job && attemptsExhausted) {
      logger.error(`[WORKER] Job permanently failed id=${job.id}`);
      markJobFailed(job.id, err.message);
    }
  });

  worker.on('error', (err) => {
    logger.error(`[WORKER] Worker error: ${err.message}`);
  });

  return worker;
}

// Mark a permanently failed job in MongoDB with the error message.
async function markJobFailed(jobId, errorMessage) {
  await EmailLog.findOneAndUpdate(
    { queueJobId: jobId },
    { status: 'failed', error: errorMessage.slice(0, 500) },
    { new: true }
  );
  logger.warn(`[WORKER] EmailLog marked failed for job ${jobId}`);
}

module.exports = { createWorker, processEmailJob, markJobFailed, isSmtpConfigured, emailQueue };