import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, Play, Server, ArrowRight, Database, Mail, MailCheck } from 'lucide-react';
import { enquiryService } from '../services/api';

export default function PerformanceDemo({ addToast }) {
  const [syncHistory, setSyncHistory] = useState([]);
  const [asyncHistory, setAsyncHistory] = useState([]);
  const [isSyncRunning, setIsSyncRunning] = useState(false);
  const [isAsyncRunning, setIsAsyncRunning] = useState(false);

  const generateRandomEnquiry = () => {
    const subjects = ['VIP Table Reservation', 'Corporate Dinner Inquiry', 'Annual Gala Booking', 'Private Terrace availability'];
    const seq = Math.floor(100 + Math.random() * 900);
    const idx = Math.floor(Math.random() * subjects.length);
    return {
      fullName: `Demo Guest ${seq}`,
      email: `demo-guest-${seq}@example.com`,
      phone: `+155501${seq}${Math.floor(1000 + Math.random() * 9000)}`,
      subject: subjects[idx],
      message: 'Testing round-trip network performance and API responsiveness with SMTP latency simulation.',
      bookingDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      guests: Math.floor(2 + Math.random() * 15),
      type: 'booking',
    };
  };

  const handleTestSync = async () => {
    setIsSyncRunning(true);
    const testData = generateRandomEnquiry();
    const startTime = Date.now();
    try {
      const res = await enquiryService.createSync(testData);
      const latency = Date.now() - startTime;
      setSyncHistory((prev) => [latency, ...prev].slice(0, 5));
      addToast({ type: 'success', message: `Sync API completed in ${latency}ms` });
    } catch (err) {
      addToast({ type: 'error', message: 'Sync API request failed.' });
    } finally {
      setIsSyncRunning(false);
    }
  };

  const handleTestAsync = async () => {
    setIsAsyncRunning(true);
    const testData = generateRandomEnquiry();
    const startTime = Date.now();
    try {
      const res = await enquiryService.create(testData);
      const latency = Date.now() - startTime;
      setAsyncHistory((prev) => [latency, ...prev].slice(0, 5));
      addToast({ type: 'success', message: `Queue API completed in ${latency}ms!` });
    } catch (err) {
      addToast({ type: 'error', message: 'Queue API request failed.' });
    } finally {
      setIsAsyncRunning(false);
    }
  };

  // Compute averages
  const avgSync = syncHistory.length ? Math.round(syncHistory.reduce((a, b) => a + b, 0) / syncHistory.length) : 0;
  const avgAsync = asyncHistory.length ? Math.round(asyncHistory.reduce((a, b) => a + b, 0) / asyncHistory.length) : 0;

  // Max latency for chart scaling (minimum 1200ms for nice scaling on initial loads)
  const maxVal = Math.max(avgSync, avgAsync, 1500);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
      {/* Title */}
      <div>
        <h2 className="font-display font-bold text-3xl text-white mb-2">Performance Benchmarking</h2>
        <p className="text-slate-400 text-sm">
          Visualize the impact of moving blocking operations (like sending emails via SMTP) to background workers.
        </p>
      </div>

      {/* Interactive Diagrams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sync Flow Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-amber-500/10 text-amber-400 rounded-lg">
              <Clock size={16} />
            </div>
            <h3 className="font-display font-semibold text-white text-sm">Synchronous Flow (Direct SMTP)</h3>
          </div>
          
          <div className="flex items-center justify-between bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-xs font-mono space-x-1.5 overflow-x-auto">
            <span className="text-slate-400">Request</span>
            <ArrowRight size={12} className="text-slate-600 flex-shrink-0" />
            <span className="text-indigo-400 flex items-center gap-1"><Database size={12} /> DB Save</span>
            <ArrowRight size={12} className="text-slate-600 flex-shrink-0" />
            <span className="text-amber-400 flex items-center gap-1"><Mail size={12} /> SMTP Send</span>
            <ArrowRight size={12} className="text-slate-600 flex-shrink-0" />
            <span className="text-slate-400">Wait Response</span>
          </div>
          
          <p className="text-slate-400 text-xs mt-4 leading-relaxed">
            The API client is locked waiting until Mongoose completes *and* Nodemailer connects to SMTP and confirms email transmission.
            If the email service experiences network lag or is down, the web server hangs, creating a poor user experience.
          </p>
        </div>

        {/* Async Flow Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <Zap size={16} />
            </div>
            <h3 className="font-display font-semibold text-white text-sm">Asynchronous Flow (Redis + BullMQ)</h3>
          </div>

          <div className="flex items-center justify-between bg-slate-950/40 p-4 rounded-xl border border-slate-900 text-xs font-mono space-x-1.5 overflow-x-auto">
            <span className="text-slate-400">Request</span>
            <ArrowRight size={12} className="text-slate-600 flex-shrink-0" />
            <span className="text-indigo-400 flex items-center gap-1"><Database size={12} /> DB Save</span>
            <ArrowRight size={12} className="text-slate-600 flex-shrink-0" />
            <span className="text-emerald-400 flex items-center gap-1">Enqueue</span>
            <ArrowRight size={12} className="text-emerald-500 flex-shrink-0" />
            <span className="text-slate-100 font-bold bg-indigo-600/20 px-1.5 py-0.5 rounded">Fast Response (~10ms)</span>
          </div>

          <p className="text-slate-400 text-xs mt-4 leading-relaxed">
            The API client receives an immediate response as soon as the email job metadata is written to the Redis store.
            A detached worker process polls Redis, processes jobs in parallel, and handles SMTP delivery failures in the background.
          </p>
        </div>
      </div>

      {/* Simulator Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actions panel */}
        <div className="glass-panel rounded-2xl p-6 space-y-6 shadow-lg">
          <h3 className="font-display font-semibold text-white text-sm border-b border-slate-800 pb-3">Test Simulator</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <button
                onClick={handleTestSync}
                disabled={isSyncRunning}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold py-3 px-4 rounded-xl transition shadow-lg shadow-amber-600/10 disabled:opacity-50"
              >
                {isSyncRunning ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play size={12} />
                )}
                Trigger Synchronous Submission
              </button>
              <p className="text-[10px] text-slate-500 text-center">Simulates standard SMTP network lag (~1200ms)</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleTestAsync}
                disabled={isAsyncRunning}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-3 px-4 rounded-xl transition shadow-lg shadow-indigo-600/10 disabled:opacity-50"
              >
                {isAsyncRunning ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play size={12} />
                )}
                Trigger Asynchronous Submission
              </button>
              <p className="text-[10px] text-slate-500 text-center">Bypasses SMTP blockage via Redis queue</p>
            </div>
          </div>

          {/* Details / Summary stats */}
          <div className="border-t border-slate-800 pt-4 space-y-3.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Sync Submissions:</span>
              <span className="font-semibold text-slate-200">{syncHistory.length} tests</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Async Submissions:</span>
              <span className="font-semibold text-slate-200">{asyncHistory.length} tests</span>
            </div>
            {avgSync > 0 && avgAsync > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/25 p-3 rounded-xl">
                <p className="text-[11px] font-semibold text-emerald-400 text-center">
                  Queue path is {Math.round(avgSync / avgAsync)}x faster!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col justify-between shadow-lg relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-1.5">Average Response Time Comparison</h3>
            <p className="text-[11px] text-slate-400 mb-6">Values represent the average client-side HTTP round-trip latency in milliseconds.</p>

            <div className="space-y-6">
              {/* Sync Bar */}
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                    <Clock size={12} /> Direct Sync (Direct SMTP Delivery)
                  </span>
                  <span className="text-sm font-bold font-mono text-white">{avgSync}ms</span>
                </div>
                <div className="w-full bg-slate-950/60 rounded-full h-8 overflow-hidden border border-slate-800/80 p-1">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-600 to-amber-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(avgSync / maxVal) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Async Bar */}
              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
                    <Zap size={12} /> Redis + BullMQ (Background Workers)
                  </span>
                  <span className="text-sm font-bold font-mono text-white">{avgAsync}ms</span>
                </div>
                <div className="w-full bg-slate-950/60 rounded-full h-8 overflow-hidden border border-slate-800/80 p-1">
                  <motion.div
                    className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(avgAsync / maxVal) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Test Logs History */}
          <div className="mt-8 pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">Sync Latency History</p>
              {syncHistory.length === 0 ? (
                <p className="text-[11px] text-slate-600">No tests executed yet</p>
              ) : (
                <div className="space-y-1 font-mono text-[11px] text-slate-400">
                  {syncHistory.map((t, idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-900 py-1">
                      <span>Test {syncHistory.length - idx}:</span>
                      <span className="font-semibold text-slate-300">{t}ms</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">Queue Latency History</p>
              {asyncHistory.length === 0 ? (
                <p className="text-[11px] text-slate-600">No tests executed yet</p>
              ) : (
                <div className="space-y-1 font-mono text-[11px] text-slate-400">
                  {asyncHistory.map((t, idx) => (
                    <div key={idx} className="flex justify-between border-b border-slate-900 py-1">
                      <span>Test {asyncHistory.length - idx}:</span>
                      <span className="font-semibold text-indigo-400">{t}ms</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
