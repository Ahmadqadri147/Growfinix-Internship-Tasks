const Enquiry = require('../models/Enquiry');
const { queueEmailsForEnquiry } = require('../queues/emailQueue');
const { sendEmail } = require('../services/emailService');
const customerConfirmation = require('../templates/customerConfirmation');
const adminNotification = require('../templates/adminNotification');
const { sanitizeBody } = require('../utils/sanitizer');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const PAGE_SIZE = 10;

// POST /api/enquiries — the queue path.
// Saves to MongoDB, adds jobs to Redis, returns immediately.
async function createEnquiry(req, res, next) {
  const startedAt = Date.now();
  try {
    const clean = sanitizeBody(req.body);
    const enquiry = await Enquiry.create({
      fullName: clean.fullName,
      email: clean.email,
      phone: clean.phone,
      subject: clean.subject,
      message: clean.message,
      bookingDate: clean.bookingDate || null,
      guests: clean.guests || 1,
      type: clean.type || 'enquiry',
    });

    logger.info(`[API] Enquiry created id=${enquiry._id}`);

    // Queue both emails — this is the only "email" work the API does.
    const queued = await queueEmailsForEnquiry(enquiry);

    const elapsed = Date.now() - startedAt;
    logger.success(`[API] Responded in ${elapsed}ms (email left to the worker)`);

    res.status(201).json({
      success: true,
      message: 'Your enquiry has been received. We will contact you shortly.',
      data: { enquiry, queuedEmails: queued, processingTimeMs: elapsed },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/enquiries/sync — DEMO ONLY.
// Sends emails synchronously before responding so the response time
// visibly grows with SMTP latency (compare with the queue path above).
async function createEnquirySync(req, res, next) {
  const startedAt = Date.now();
  try {
    const clean = sanitizeBody(req.body);
    const enquiry = await Enquiry.create({
      fullName: clean.fullName,
      email: clean.email,
      phone: clean.phone,
      subject: clean.subject,
      message: clean.message,
      bookingDate: clean.bookingDate || null,
      guests: clean.guests || 1,
      type: clean.type || 'enquiry',
    });

    const [customerEmail, adminEmail] = [enquiry.email, process.env.ADMIN_EMAIL];

    // The API now waits for BOTH emails before responding — slow!
    await Promise.all([
      sendEmail({
        to: customerEmail,
        subject: 'Your enquiry has been received',
        html: customerConfirmation(enquiry),
      }),
      sendEmail({
        to: adminEmail,
        subject: `New enquiry received — ${enquiry.fullName}`,
        html: adminNotification(enquiry),
      }),
    ]);

    const elapsed = Date.now() - startedAt;
    logger.warn(`[API] SYNC path took ${elapsed}ms — the queue path would have been ~instant`);

    res.status(201).json({
      success: true,
      message: 'Emails sent synchronously (demo path)',
      data: { enquiry, processingTimeMs: elapsed },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/enquiries?page=1&limit=10&search=john
async function listEnquiries(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || PAGE_SIZE);
    const search = (req.query.search || '').trim();

    const filter = search
      ? {
          $or: [
            { fullName: new RegExp(search, 'i') },
            { email: new RegExp(search, 'i') },
            { subject: new RegExp(search, 'i') },
          ],
        }
      : {};

    const [total, enquiries] = await Promise.all([
      Enquiry.countDocuments(filter),
      Enquiry.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
    ]);

    res.json({
      success: true,
      data: enquiries,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/enquiries/:id
async function getEnquiry(req, res, next) {
  try {
    const enquiry = await Enquiry.findById(req.params.id).populate({
      path: 'emails',
      model: 'EmailLog',
      options: { sort: { createdAt: -1 } },
    });
    if (!enquiry) throw new AppError('Enquiry not found', 404);
    res.json({ success: true, data: enquiry });
  } catch (err) {
    next(err);
  }
}

module.exports = { createEnquiry, createEnquirySync, listEnquiries, getEnquiry };