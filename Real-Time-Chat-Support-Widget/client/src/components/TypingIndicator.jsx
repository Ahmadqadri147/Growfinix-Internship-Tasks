import { motion } from 'framer-motion';

export default function TypingIndicator({ typingUsers }) {
  if (!typingUsers?.length) return null;

  const label =
    typingUsers.length === 1
      ? `${typingUsers[0].username} is typing`
      : `${typingUsers.length} people are typing`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-center gap-2 px-1"
    >
      <div className="flex items-center gap-1 rounded-2xl bg-white px-3 py-2 shadow-sm dark:bg-white/10">
        <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-brand-500" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-brand-500" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 animate-bounce-dot rounded-full bg-brand-500" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-xs italic text-slate-400 dark:text-slate-500">{label}…</span>
    </motion.div>
  );
}
