import { motion } from 'framer-motion';
import { QUICK_EMOJIS } from '../utils/emojis.js';

export default function EmojiPicker({ onSelect, onClose }) {
  return (
    <>
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        className="fixed inset-0 z-10 cursor-default"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full left-0 z-20 mb-2 grid grid-cols-8 gap-1 rounded-xl border border-black/5 bg-white p-2 shadow-glass-lg dark:border-white/10 dark:bg-surface-darkcard"
      >
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onSelect(emoji)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-lg transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
          >
            {emoji}
          </button>
        ))}
      </motion.div>
    </>
  );
}
