const mongoose = require('mongoose');

const emailStatusEnum = ['pending', 'queued', 'processing', 'sent', 'failed'];

const emailLogSchema = new mongoose.Schema(
  {
    queueJobId: { type: String, default: null },
    to: { type: String, required: true, trim: true, lowercase: true },
    from: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    emailType: {
      type: String,
      enum: ['customer_confirmation', 'admin_notification'],
      required: true,
    },
    enquiryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enquiry',
      required: true,
      index: true,
    },
    status: { type: String, enum: emailStatusEnum, default: 'pending', index: true },
    attempts: { type: Number, default: 0 },
    error: { type: String, default: null },
    sentAt: { type: Date, default: null },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

emailLogSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('EmailLog', emailLogSchema);