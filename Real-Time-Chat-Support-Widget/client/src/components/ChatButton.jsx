import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';

export default function ChatButton({ isOpen, onClick, unreadCount = 0 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
      className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient shadow-glass-lg transition-transform duration-200 hover:scale-105 active:scale-95"
    >
      {/* Ambient pulse ring, signals "we're here and live" */}
      {!isOpen && (
        <span className="absolute inset-0 rounded-full bg-brand-gradient animate-pulse-ring" />
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isOpen ? 'close' : 'open'}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="relative flex items-center justify-center text-white"
        >
          {isOpen ? <X size={26} /> : <MessageCircle size={26} strokeWidth={2.2} />}
        </motion.span>
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="absolute -right-1 -top-1 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-offline px-1.5 text-[11px] font-bold text-white ring-2 ring-white dark:ring-surface-dark"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
