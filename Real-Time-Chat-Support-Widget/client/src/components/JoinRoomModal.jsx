import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useChat } from '../context/ChatContext.jsx';

export default function JoinRoomModal({ onClose, initialRoomCode = '' }) {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { joinRoom } = useChat();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = roomCode.trim();
    if (!trimmed) {
      setError('Please enter a room code');
      return;
    }
    if (!password.trim()) {
      setError('Room password is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await joinRoom(trimmed, password.trim());
      onClose();
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button type="button" aria-hidden="true" tabIndex={-1} className="fixed inset-0 z-40 cursor-default bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-black/5 bg-white p-6 shadow-glass-lg"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-slate-900">Join Room</h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Room Code</label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Paste room code here"
              autoFocus
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">Room Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter room password"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <p className="mt-1 text-[10px] text-slate-400">
              Ask the room creator for the password
            </p>
          </div>

          {error && <p className="text-xs text-rose-500">{error}</p>}

          <button
            type="submit"
            disabled={loading || !roomCode.trim() || !password.trim()}
            className="w-full rounded-xl bg-brand-gradient py-2.5 text-sm font-semibold text-white transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Joining...' : 'Join Room'}
          </button>
        </form>
      </motion.div>
    </>
  );
}
