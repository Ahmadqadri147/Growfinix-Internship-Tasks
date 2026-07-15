import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const toastVariants = {
  initial: { opacity: 0, x: 100, y: 0 },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
};

const Toast = ({ toast, onClose, onUndo }) => {
  const icons = {
    success: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <motion.div
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        'glass rounded-xl p-4 pr-8 flex items-center gap-3 min-w-[320px] max-w-sm',
        toast.type === 'success' && 'border-green-500/30',
        toast.type === 'error' && 'border-red-500/30',
        toast.type === 'warning' && 'border-yellow-500/30',
        toast.type === 'info' && 'border-blue-500/30'
      )}
    >
      {icons[toast.type]}
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{toast.title}</h4>
        <p className="text-sm text-gray-300 mt-0.5">{toast.message}</p>
      </div>
      {onUndo && (
        <button
          onClick={onUndo}
          className="text-sm text-blue-400 hover:text-blue-300 font-medium"
        >
          Undo
        </button>
      )}
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
};

const ToastContainer = ({ toasts }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-md pr-4">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={toast.onClose}
            onUndo={toast.onUndo}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const toastStyles = {
  glass: 'glass',
  solid: 'bg-gray-800',
  success: 'glass border-green-500/30',
  error: 'glass border-red-500/30',
  warning: 'glass border-yellow-500/30',
  info: 'glass border-blue-500/30',
};

export { Toast, ToastContainer };