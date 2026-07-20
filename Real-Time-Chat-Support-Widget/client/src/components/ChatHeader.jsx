import { useState } from 'react';
import { Download, MoreVertical, Trash2, X } from 'lucide-react';
import ConnectionStatus from './ConnectionStatus.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function ChatHeader({
  connectionStatus,
  onlineCount,
  onClose,
  onClearChat,
  onExportChat,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-t-2xl bg-brand-gradient px-4 py-3.5">
      {/* Ambient animated blobs for a bit of life behind the header content */}
      <div className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl animate-blob" />
      <div className="pointer-events-none absolute -left-8 bottom-0 h-20 w-20 rounded-full bg-violet-300/20 blur-2xl animate-blob" style={{ animationDelay: '2s' }} />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-display text-lg font-bold text-white ring-2 ring-white/30">
            S
          </div>
          <div>
            <p className="font-display text-sm font-bold leading-tight text-white">Support Team</p>
            <div className="flex items-center gap-2">
              <ConnectionStatus status={connectionStatus} />
              <span className="text-white/40">•</span>
              <span className="text-xs text-white/85">{onlineCount} online</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More options"
              aria-expanded={menuOpen}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-hidden="true"
                  tabIndex={-1}
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-black/5 bg-white py-1 shadow-glass-lg dark:border-white/10 dark:bg-surface-darkcard">
                  <button
                    type="button"
                    onClick={() => {
                      onExportChat();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5"
                  >
                    <Download size={14} /> Export chat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClearChat();
                      setMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-offline hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 size={14} /> Clear chat
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
