const { Queue } = require('bullmq');
const { createRedisConnection } = require('../config/redis');
const config = require('../config/env');
const EmailLog = require('../models/EmailLog');
const logger = require('../utils/logger');

const QUEUE_NAME = 'emailQueue';

// Shared queue instance — the API enqueues here and never
// touches Nodemailer directly.
const emailQueue = new Queue(QUEUE_NAME, {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 500 },
    timeout: 45000,
  },
});

async function addEmailJob(jobData) {
  const job = await emailQueue.add('send-email', jobData);
  logger.info(`[QUEUE] Email job added → id=${job.id} type=${jobData.emailType} to=${jobData.recipient}`);
  return job;
}

// Creates email logs + queues jobs for a fresh enquiry.
// Two jobs per enquiry: customer confirmation + admin notification.
// Returns fast — no SMTP interaction happens in this call path.
async function queueEmailsForEnquiry(enquiry) {
  const jobs = [
    {
      emailType: 'customer_confirmation',
      to: enquiry.email,
      from: config.adminEmail,
    },
    {
      emailType: 'admin_notification',
      to: config.adminEmail,
      from: config.adminEmail,
    },
  ];

  const results = [];
  for (const jobMeta of jobs) {
    const subject = jobMeta.emailType === 'admin_notification'
      ? `New enquiry received — ${enquiry.fullName}`
      : 'Your enquiry has been received';

    const log = await EmailLog.create({
      to: jobMeta.to,
      from: jobMeta.from,
      subject,
      emailType: jobMeta.emailType,
      enquiryId: enquiry._id,
      status: 'pending',
    });

    const job = await addEmailJob({
      emailLogId: log._id.toString(),
      enquiryId: enquiry._id.toString(),
      recipient: jobMeta.to,
      sender: jobMeta.from,
      subject,
      emailType: jobMeta.emailType,
      customer: {
        fullName: enquiry.fullName,
        email: enquiry.email,
        phone: enquiry.phone,
      },
      enquiry: {
        fullName: enquiry.fullName,
        email: enquiry.email,
        phone: enquiry.phone,
        subject: enquiry.subject,
        message: enquiry.message,
        bookingDate: enquiry.bookingDate,
        guests: enquiry.guests,
        type: enquiry.type,
        _id: enquiry._id,
        createdAt: enquiry.createdAt,
      },
      timestamp: new Date().toISOString(),
    });

    await log.updateOne({ queueJobId: job.id, status: 'queued' });
    results.push({ jobId: job.id, emailLogId: log._id, emailType: jobMeta.emailType });
  }
  return results;
}

async function getQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    emailQueue.getWaitingCount(),
    emailQueue.getActiveCount(),
    emailQueue.getCompletedCount(),
    emailQueue.getFailedCount(),
    emailQueue.getDelayedCount(),
  ]);
  return { waiting, active, completed, failed, delayed };
}

async function retryJob(existingJobId) {
  // Re-add a job with fresh identity so BullMQ applies full retry rules again.
  const oldJob = await emailQueue.getJob(existingJobId);
  if (!oldJob) return null;
  const newJob = await emailQueue.add('send-email', oldJob.data);
  return newJob;
}

async function getJobState(existingJobId) {
  const oldJob = await emailQueue.getJob(existingJobId);
  if (!oldJob) return 'missing';
  return oldJob.getState();
}

async function removeJob(existingJobId) {
  const oldJob = await emailQueue.getJob(existingJobId);
  if (oldJob) await oldJob.remove();
}

async function closeQueue() {
  await emailQueue.close();
}

module.exports = {
  QUEUE_NAME,
  emailQueue,
  addEmailJob,
  queueEmailsForEnquiry,
  getQueueStats,
  retryJob,
  getJobState,
  removeJob,
  closeQueue,
};