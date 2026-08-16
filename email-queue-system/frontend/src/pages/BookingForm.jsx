import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Phone, Users, Send, CheckCircle2, Clock, Zap, User, BookOpen, MessageSquare } from 'lucide-react';
import { enquiryService } from '../services/api';

export default function BookingForm({ addToast }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    bookingDate: '',
    guests: 1,
    type: 'enquiry',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMode, setSubmitMode] = useState('async'); // 'async' (queue) or 'sync'
  const [result, setResult] = useState(null);

  const validate = () => {
    const tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = 'Full Name is required';
    else if (formData.fullName.length < 2 || formData.fullName.length > 100)
      tempErrors.fullName = 'Name must be between 2 and 100 characters';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) tempErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) tempErrors.email = 'Email is invalid';

    if (!formData.phone.trim()) tempErrors.phone = 'Phone number is required';

    if (!formData.subject.trim()) tempErrors.subject = 'Subject is required';
    else if (formData.subject.length < 3 || formData.subject.length > 200)
      tempErrors.subject = 'Subject must be between 3 and 200 characters';

    if (!formData.message.trim()) tempErrors.message = 'Message is required';
    else if (formData.message.length < 10 || formData.message.length > 5000)
      tempErrors.message = 'Message must be between 10 and 5000 characters';

    if (formData.bookingDate) {
      const selectedDate = new Date(formData.bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) tempErrors.bookingDate = 'Booking date cannot be in the past';
    }

    if (formData.guests < 1 || formData.guests > 50) {
      tempErrors.guests = 'Guests must be between 1 and 50';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value, 10) || 1 : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast({ type: 'error', message: 'Please correct the highlighted form errors.' });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      let response;
      if (submitMode === 'async') {
        response = await enquiryService.create(formData);
      } else {
        response = await enquiryService.createSync(formData);
      }

      setResult({
        success: true,
        message: response.message,
        timeMs: response.data.processingTimeMs,
        mode: submitMode,
        data: response.data,
      });

      addToast({
        type: 'success',
        message: submitMode === 'async' 
          ? 'Enquiry created! Emails queued instantly.' 
          : 'Enquiry created! Emails sent synchronously.',
      });

      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        bookingDate: '',
        guests: 1,
        type: 'enquiry',
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to submit enquiry.';
      addToast({ type: 'error', message: errMsg });
      setResult({
        success: false,
        error: errMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Title Header */}
      <div className="mb-8">
        <h2 className="font-display font-bold text-3xl text-white mb-2">Book or Make an Enquiry</h2>
        <p className="text-slate-400 text-sm">
          Submit details for your reservation or query. Compare the speed of immediate queues vs. direct SMTP.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Panel */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Mode Selector */}
          <div className="mb-6 flex gap-4 p-1 bg-slate-900/80 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSubmitMode('async')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                submitMode === 'async'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap size={14} />
              Asynchronous (Queue)
            </button>
            <button
              type="button"
              onClick={() => setSubmitMode('sync')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-200 ${
                submitMode === 'sync'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock size={14} />
              Synchronous (Direct)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={`w-full bg-slate-950/60 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                      errors.fullName
                        ? 'border-red-500/50 focus:ring-red-500/20'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>
                {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 invisible" />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-semibold">@</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full bg-slate-950/60 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                      errors.email
                        ? 'border-red-500/50 focus:ring-red-500/20'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Row 2: Phone & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className={`w-full bg-slate-950/60 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                      errors.phone
                        ? 'border-red-500/50 focus:ring-red-500/20'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Request Type
                </label>
                <div className="flex gap-4">
                  <label className="flex-1 flex items-center justify-center gap-2 bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-4 cursor-pointer hover:bg-slate-900/50 transition">
                    <input
                      type="radio"
                      name="type"
                      value="enquiry"
                      checked={formData.type === 'enquiry'}
                      onChange={handleChange}
                      className="accent-indigo-500"
                    />
                    <span className="text-sm text-slate-300">General Enquiry</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center gap-2 bg-slate-950/40 border border-slate-800 rounded-xl py-2.5 px-4 cursor-pointer hover:bg-slate-900/50 transition">
                    <input
                      type="radio"
                      name="type"
                      value="booking"
                      checked={formData.type === 'booking'}
                      onChange={handleChange}
                      className="accent-indigo-500"
                    />
                    <span className="text-sm text-slate-300">Booking Request</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Row 3: Booking Date & Guests (conditional or empty defaults) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Preferred Date (Optional)
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="date"
                    name="bookingDate"
                    value={formData.bookingDate}
                    onChange={handleChange}
                    className={`w-full bg-slate-950/60 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                      errors.bookingDate
                        ? 'border-red-500/50 focus:ring-red-500/20'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>
                {errors.bookingDate && <p className="text-red-400 text-xs mt-1">{errors.bookingDate}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Number of Guests
                </label>
                <div className="relative">
                  <Users size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="number"
                    name="guests"
                    min="1"
                    max="50"
                    value={formData.guests}
                    onChange={handleChange}
                    className={`w-full bg-slate-950/60 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                      errors.guests
                        ? 'border-red-500/50 focus:ring-red-500/20'
                        : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                    }`}
                  />
                </div>
                {errors.guests && <p className="text-red-400 text-xs mt-1">{errors.guests}</p>}
              </div>
            </div>

            {/* Row 4: Subject */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Subject
              </label>
              <div className="relative">
                <BookOpen size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Enter your subject"
                  className={`w-full bg-slate-950/60 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all ${
                    errors.subject
                      ? 'border-red-500/50 focus:ring-red-500/20'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
            </div>

            {/* Row 5: Message */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Message Details
              </label>
              <div className="relative">
                <MessageSquare size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Enter details about your request (min 10 characters)..."
                  className={`w-full bg-slate-950/60 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 transition-all resize-none ${
                    errors.message
                      ? 'border-red-500/50 focus:ring-red-500/20'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold tracking-wide text-white transition-all shadow-lg focus:outline-none ${
                submitMode === 'async'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/10'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 hover:shadow-amber-500/10'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Submission...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Request
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sidebar Info Panel & Live Results */}
        <div className="space-y-6">
          {/* Asynchronous vs Synchronous Explainer */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-md">
            <h3 className="font-display font-semibold text-white mb-3 text-sm flex items-center gap-2">
              <Zap size={16} className="text-indigo-400" />
              Mode Comparison
            </h3>
            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-indigo-600/5 border border-indigo-500/10">
                <p className="font-semibold text-indigo-400 mb-1">Queue (Asynchronous)</p>
                <p className="text-slate-400 leading-relaxed">
                  Saves to DB, immediately appends job to Redis, and responds to frontend. 
                  Background workers dispatch Nodemailer tasks concurrently. Response is **near instant (~10ms)**.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-600/5 border border-amber-500/10">
                <p className="font-semibold text-amber-400 mb-1">Direct (Synchronous)</p>
                <p className="text-slate-400 leading-relaxed">
                  Saves to DB, waits for Nodemailer to connect, render templates, and deliver both emails. 
                  Response is blocked by SMTP speed **(takes ~1.2s)**.
                </p>
              </div>
            </div>
          </div>

          {/* Submission Result Log */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className={`rounded-2xl p-6 border shadow-lg ${
                  result.success
                    ? 'bg-slate-900/60 border-indigo-500/20'
                    : 'bg-red-950/20 border-red-500/20'
                }`}
              >
                {result.success ? (
                  <div>
                    <div className="flex items-center gap-2.5 text-emerald-400 mb-3">
                      <CheckCircle2 size={20} />
                      <h4 className="font-display font-semibold text-sm text-white">Submission Successful</h4>
                    </div>
                    <p className="text-xs text-slate-300 mb-4 leading-relaxed">{result.message}</p>
                    
                    <div className="border-t border-slate-800/80 pt-4 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Processing Mode:</span>
                        <span className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded-full ${
                          result.mode === 'async'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {result.mode === 'async' ? 'Queue (Async)' : 'Direct (Sync)'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Round-trip Time:</span>
                        <span className={`font-semibold flex items-center gap-1 ${
                          result.mode === 'async' ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          <Clock size={12} />
                          {result.timeMs}ms
                        </span>
                      </div>

                      {result.data?.queuedEmails && result.data.queuedEmails.length > 0 && (
                        <div className="border-t border-slate-800/60 pt-3 mt-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Queued BullMQ Jobs
                          </p>
                          <div className="space-y-1.5">
                            {result.data.queuedEmails.map((e, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-slate-950/40 p-2 rounded-lg border border-slate-800/40 text-[11px]">
                                <span className="font-mono text-slate-500 text-[10px]">#{e.jobId}</span>
                                <span className="text-slate-400 capitalize">{e.emailType.replace('_', ' ')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-display font-semibold text-sm text-white mb-2">Submission Failed</h4>
                    <p className="text-xs text-red-400">{result.error}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
