import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
import { formatTime } from '../utils/time.js';
import { copyToClipboard } from '../utils/helpers.js';

function AvatarDisplay({ avatar, username }) {
  if (!avatar) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold text-white ring-2 ring-white">
        {username?.charAt(0) || '?'}
      </div>
    );
  }
  if (avatar.emoji) {
    return (
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-sm ring-2 ring-white">
        {avatar.emoji}
      </div>
    );
  }
  if (avatar.url) {
    return (
      <img src={avatar.url} alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-white" />
    );
  }
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold text-white ring-2 ring-white">
      {username?.charAt(0) || '?'}
    </div>
  );
}

export default function MessageBubble({ message, isOwn, showAvatar }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className="w-7 shrink-0">
        {showAvatar && !isOwn && (
          <AvatarDisplay avatar={message.sender?.avatar} username={message.sender?.username} />
        )}
      </div>

      <div className={`relative max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`relative rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
            isOwn
              ? 'bubble-tail-right bg-brand-gradient text-white'
              : 'bubble-tail-left bg-white text-slate-700'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.text}</p>

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy message"
            className={`absolute -top-3 flex h-6 w-6 items-center justify-center rounded-full opacity-0 shadow-glass transition-opacity duration-150 group-hover:opacity-100 ${
              isOwn ? '-left-3 bg-white text-slate-500' : '-right-3 bg-white text-slate-500'
            }`}
          >
            {copied ? <Check size={12} className="text-online" /> : <Copy size={12} />}
          </button>
        </div>

        <span className="mt-1 flex items-center gap-1 px-1 text-[10px] text-slate-400">
          {!isOwn && message.sender?.username && (
            <span className="font-medium text-brand-600">{message.sender.username}</span>
          )}
          {!isOwn && message.sender?.username && <span>•</span>}
          <span>{formatTime(message.timestamp)}</span>
        </span>
      </div>
    </motion.div>
  );
}
