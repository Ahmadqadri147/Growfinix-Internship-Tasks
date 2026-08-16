const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    bookingDate: { type: Date },
    guests: { type: Number, min: 1, max: 50, default: 1 },
    type: { type: String, enum: ['enquiry', 'booking'], default: 'enquiry' },
    status: { type: String, enum: ['new', 'contacted', 'completed'], default: 'new' },
  },
  { timestamps: true }
);

enquirySchema.index({ createdAt: -1 });

enquirySchema.virtual('emails', {
  ref: 'EmailLog',
  localField: '_id',
  foreignField: 'enquiryId',
});

enquirySchema.set('toJSON', { virtuals: true });
enquirySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Enquiry', enquirySchema);