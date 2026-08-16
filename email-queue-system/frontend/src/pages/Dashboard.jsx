import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Trash2, Play, Search, AlertCircle, ChevronLeft, ChevronRight, Activity, MailCheck, MailQuestion, Users, CheckCircle2, Clock } from 'lucide-react';
import { emailService, queueService } from '../services/api';

const STATUS_CONFIGS = {
  pending: { label: 'Pending', bg: 'bg-gray-500/10 border-gray-500/20 text-gray-400' },
  queued: { label: 'Queued', bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
  processing: { label: 'Processing', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  sent: { label: 'Sent', bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
  failed: { label: 'Failed', bg: 'bg-red-500/10 border-red-500/20 text-red-400' },
};

export default function Dashboard({ addToast }) {
  const [emails, setEmails] = useState([]);
  const [counts, setCounts] = useState({ pending: 0, queued: 0, processing: 0, sent: 0, failed: 0 });
  const [queueStats, setQueueStats] = useState({ waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 });
  const [enquiryCount, setEnquiryCount] = useState(0);

  const [statusFilter, setStatusFilter] = useState(''); // '' maps to 'All'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      // Fetch queue stats
      const qRes = await queueService.getStats();
      if (qRes.success) {
        setQueueStats(qRes.data.queue);
        setEnquiryCount(qRes.data.enquiries.total);
      }

      // Fetch emails
      const eRes = await emailService.list({
        status: statusFilter || undefined,
        page: currentPage,
        limit: 8,
      });
      if (eRes.success) {
        setEmails(eRes.data);
        setCounts(eRes.counts);
        setTotalPages(eRes.meta.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', message: 'Failed to synchronize dashboard statistics.' });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, statusFilter, addToast]);

  // Periodic polling for auto-refresh
  useEffect(() => {
    fetchData(true);
  }, [currentPage, statusFilter]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  const handleRetry = async (jobId) => {
    try {
      addToast({ type: 'info', message: 'Scheduling job retry...' });
      const res = await emailService.retry(jobId);
      if (res.success) {
        addToast({ type: 'success', message: 'Email has been successfully re-queued!' });
        fetchData(false);
      }
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.message || 'Failed to retry email job.' });
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this email log? This removes any active job in Redis as well.')) return;
    try {
      const res = await emailService.delete(jobId);
      if (res.success) {
        addToast({ type: 'success', message: 'Email log deleted.' });
        fetchData(false);
      }
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to delete email log.' });
    }
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Client side search filtering across current page records for UI responsiveness
  const filteredEmails = emails.filter((email) => {
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    const customer = email.enquiryId?.fullName || '';
    const to = email.to || '';
    const subject = email.subject || '';
    return (
      customer.toLowerCase().includes(term) ||
      to.toLowerCase().includes(term) ||
      subject.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 py-6 px-4 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-3xl text-white mb-1.5 flex items-center gap-2.5">
            Admin Queue Control
            {isRefreshing && <RefreshCw className="animate-spin text-indigo-400" size={20} />}
          </h2>
          <p className="text-slate-400 text-sm">
            Monitor background mail delivery, view queue metrics, and manage failed deliveries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs text-slate-300">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-indigo-500 rounded"
            />
            Live Auto-Sync (4s)
          </label>
          <button
            onClick={() => fetchData(false)}
            className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs px-4 py-2.5 rounded-xl font-medium transition"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Enquiries */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enquiries</span>
            <Users className="text-indigo-400" size={18} />
          </div>
          <p className="font-display font-bold text-3xl text-white leading-none">
            {isLoading ? '...' : enquiryCount}
          </p>
          <p className="text-[10px] text-slate-500 mt-2 font-semibold uppercase tracking-wider">Saved in MongoDB</p>
        </div>

        {/* Card 2: Sent Successfully */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Sent Emails</span>
            <MailCheck className="text-emerald-400" size={18} />
          </div>
          <p className="font-display font-bold text-3xl text-white leading-none">
            {isLoading ? '...' : counts.sent}
          </p>
          <p className="text-[10px] text-slate-500 mt-2 font-semibold uppercase tracking-wider">SMTP dispatches finished</p>
        </div>

        {/* Card 3: Failed Emails */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Failed Emails</span>
            <MailQuestion className="text-red-400" size={18} />
          </div>
          <p className="font-display font-bold text-3xl text-red-400 leading-none">
            {isLoading ? '...' : counts.failed}
          </p>
          <p className="text-[10px] text-slate-500 mt-2 font-semibold uppercase tracking-wider">Awaiting manual retry</p>
        </div>

        {/* Card 4: Redis Queue Load */}
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Redis Active/Waiting</span>
            <Activity className="text-indigo-400" size={18} />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="font-display font-bold text-3xl text-white leading-none">
              {isLoading ? '...' : queueStats.active}
            </p>
            <span className="text-xs text-slate-500">/ {queueStats.waiting} waiting</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-semibold uppercase tracking-wider">BullMQ queue volume</p>
        </div>
      </div>

      {/* Visual Live Queue Monitor */}
      <div className="glass-panel rounded-2xl p-6 shadow-md border border-slate-800">
        <h3 className="font-display font-semibold text-white mb-4 text-sm flex items-center gap-2">
          <Activity size={16} className="text-indigo-400 animate-pulse" />
          Live Redis Queue Monitor (BullMQ)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {[
            { label: 'Waiting', val: queueStats.waiting, color: 'bg-indigo-500' },
            { label: 'Active', val: queueStats.active, color: 'bg-amber-500 animate-pulse' },
            { label: 'Completed', val: queueStats.completed, color: 'bg-emerald-500' },
            { label: 'Failed (Redis)', val: queueStats.failed, color: 'bg-red-500' },
            { label: 'Delayed', val: queueStats.delayed, color: 'bg-purple-500' },
          ].map((bar, i) => (
            <div key={i} className="bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{bar.label}</span>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-2xl font-bold font-display text-white">{bar.val}</span>
                <span className="text-[10px] text-slate-500">jobs</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full ${bar.color}`}
                  style={{ width: `${Math.min(100, (bar.val / (queueStats.completed + queueStats.failed + queueStats.waiting + queueStats.active + 1)) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs Table Area */}
      <div className="glass-panel rounded-2xl shadow-xl overflow-hidden border border-slate-800">
        {/* Table Filters Header */}
        <div className="p-5 border-b border-slate-800/80 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-slate-900/40">
          <div className="flex flex-wrap gap-2">
            {[
              { id: '', label: 'All Logs', count: counts.pending + counts.queued + counts.processing + counts.sent + counts.failed },
              { id: 'queued', label: 'Queued', count: counts.queued },
              { id: 'processing', label: 'Processing', count: counts.processing },
              { id: 'sent', label: 'Sent', count: counts.sent },
              { id: 'failed', label: 'Failed', count: counts.failed },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleFilterChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition ${
                  statusFilter === tab.id
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  statusFilter === tab.id ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-900 text-slate-500'
                }`}>
                  {tab.count || 0}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search page logs..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Table itself */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400">
              <div className="w-10 h-10 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin mb-4" />
              <p className="text-xs font-medium">Synchronizing records...</p>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="py-24 text-center">
              <AlertCircle size={36} className="text-slate-600 mx-auto mb-3" />
              <h4 className="font-display font-medium text-white mb-1">No Email Logs Found</h4>
              <p className="text-xs text-slate-500">
                {statusFilter ? `No logs found matching the '${statusFilter}' filter.` : 'No enquiries have been submitted yet.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/20 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-4 px-6">Job ID</th>
                  <th className="py-4 px-6">Recipient & Client</th>
                  <th className="py-4 px-6">Type & Subject</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Attempts</th>
                  <th className="py-4 px-6">Activity Dates</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs text-slate-300">
                {filteredEmails.map((email) => {
                  const statusConf = STATUS_CONFIGS[email.status] || { label: email.status, bg: 'bg-slate-800' };
                  return (
                    <tr key={email._id} className="hover:bg-slate-900/30 transition-colors">
                      {/* Job ID */}
                      <td className="py-4 px-6 font-mono text-[11px] text-slate-500">
                        {email.queueJobId ? `#${email.queueJobId}` : '—'}
                      </td>

                      {/* Recipient */}
                      <td className="py-4 px-6">
                        <p className="font-medium text-white">{email.enquiryId?.fullName || 'Anonymous'}</p>
                        <p className="text-slate-500 text-[11px] mt-0.5">{email.to}</p>
                      </td>

                      {/* Type & Subject */}
                      <td className="py-4 px-6 max-w-xs">
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-md">
                          {email.emailType === 'admin_notification' ? 'Admin Notify' : 'Customer Confirmation'}
                        </span>
                        <p className="text-slate-400 truncate mt-1.5" title={email.subject}>
                          {email.subject}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border text-[10px] font-medium rounded-full ${statusConf.bg}`}>
                          {statusConf.label}
                        </span>
                        {email.status === 'failed' && email.error && (
                          <p className="text-[10px] text-red-400 mt-1 max-w-[180px] truncate" title={email.error}>
                            Reason: {email.error}
                          </p>
                        )}
                      </td>

                      {/* Attempts */}
                      <td className="py-4 px-6 text-center font-mono">
                        {email.attempts} / 3
                      </td>

                      {/* Activity Dates */}
                      <td className="py-4 px-6 text-[11px] text-slate-500 space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="w-8">Created:</span>
                          <span className="text-slate-400">
                            {new Date(email.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                        </div>
                        {email.processedAt && (
                          <div className="flex items-center gap-1">
                            <span className="w-8">Sent:</span>
                            <span className="text-slate-400">
                              {new Date(email.processedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right space-x-2">
                        {email.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(email.queueJobId)}
                            className="p-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg transition"
                            title="Retry Job"
                          >
                            <Play size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(email.queueJobId)}
                          className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition"
                          title="Delete Log"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/20 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Page {currentPage} of {totalPages}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-1.5 bg-slate-950/40 hover:bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-slate-200 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="p-1.5 bg-slate-950/40 hover:bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-slate-200 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
