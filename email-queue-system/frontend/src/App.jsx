import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import BookingForm from './pages/BookingForm';
import Dashboard from './pages/Dashboard';
import PerformanceDemo from './pages/PerformanceDemo';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('booking');
  const [toasts, setToasts] = useState([]);

  const addToast = ({ type = 'info', message = '' }) => {
    const id = Date.now() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Viewport */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="min-h-full"
          >
            {activeTab === 'booking' && <BookingForm addToast={addToast} />}
            {activeTab === 'dashboard' && <Dashboard addToast={addToast} />}
            {activeTab === 'performance' && <PerformanceDemo addToast={addToast} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Toast Notification Centre */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-xl bg-slate-900 ${
                  isSuccess
                    ? 'border-emerald-500/20 text-emerald-400'
                    : isError
                    ? 'border-red-500/20 text-red-400'
                    : 'border-indigo-500/20 text-indigo-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isSuccess ? (
                    <CheckCircle2 size={16} />
                  ) : isError ? (
                    <AlertCircle size={16} />
                  ) : (
                    <Info size={16} />
                  )}
                  <span className="text-xs font-semibold text-slate-200">{toast.message}</span>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-500 hover:text-slate-300 transition pl-1"
                >
                  <X size={12} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
