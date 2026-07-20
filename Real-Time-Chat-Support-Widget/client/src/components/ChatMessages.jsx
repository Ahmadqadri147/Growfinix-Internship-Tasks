import { AnimatePresence } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import { useAutoScroll } from '../hooks/useAutoScroll.js';

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient-soft">
        <Sparkles size={24} className="text-brand-600 dark:text-brand-300" />
      </div>
      <p className="font-display text-sm font-semibold text-slate-600 dark:text-slate-200">
        Start the conversation
      </p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
        Ask us anything — we usually reply within minutes.
      </p>
    </div>
  );
}

export default function ChatMessages({ messages, typingUsers, currentUserId }) {
  const { containerRef, bottomRef, isAtBottom, scrollToBottom } = useAutoScroll([
    messages.length,
    typingUsers.length,
  ]);

  return (
    <div className="relative flex-1 overflow-hidden bg-surface-light dark:bg-surface-dark">
      <div className="pointer-events-none absolute inset-0 bg-aurora opacity-40 dark:opacity-20" />

      <div
        ref={containerRef}
        className="chat-scroll relative h-full space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              const isOwn = message.sender.username === currentUserId;
              const prev = messages[index - 1];
              const showAvatar = !prev || prev.sender.username !== message.sender.username;
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                />
              );
            })}
          </AnimatePresence>
        )}

        <TypingIndicator typingUsers={typingUsers} />
        <div ref={bottomRef} />
      </div>

      {!isAtBottom && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Scroll to latest messages"
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-glass-lg transition-transform hover:scale-105 dark:bg-surface-darkcard dark:text-slate-200"
        >
          <ArrowDown size={12} /> New messages
        </button>
      )}
    </div>
  );
}
