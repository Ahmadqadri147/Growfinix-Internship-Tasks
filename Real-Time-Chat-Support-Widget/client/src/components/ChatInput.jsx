import { useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Send, Smile } from 'lucide-react';
import EmojiPicker from './EmojiPicker.jsx';

export default function ChatInput({ onSend, onTyping, onStopTyping, disabled }) {
  const [value, setValue] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setValue(e.target.value);
    onTyping();

    // Auto-grow the textarea up to a max height
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 96)}px`;
    }
  };

  const submit = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
    onStopTyping();
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    // Shift+Enter falls through to default behavior -> newline
  };

  const insertEmoji = (emoji) => {
    setValue((v) => v + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative border-t border-slate-100 bg-white px-3 py-3 dark:border-white/5 dark:bg-surface-darkcard">
      <AnimatePresence>
        {showEmoji && <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmoji(false)} />}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => setShowEmoji((v) => !v)}
          aria-label="Insert emoji"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/5"
        >
          <Smile size={18} />
        </button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={onStopTyping}
          rows={1}
          placeholder="Type a message…"
          aria-label="Type a message"
          className="chat-scroll max-h-24 flex-1 resize-none rounded-2xl bg-slate-100 px-3.5 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:bg-white/5 dark:text-slate-100"
        />

        <button
          type="button"
          onClick={submit}
          disabled={!value.trim() || disabled}
          aria-label="Send message"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-white transition-transform enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
      <p className="mt-1.5 pl-1 text-[10px] text-slate-300 dark:text-slate-600">
        Enter to send • Shift + Enter for new line
      </p>
    </div>
  );
}
