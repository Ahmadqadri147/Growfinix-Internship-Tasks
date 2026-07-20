import { useState, useRef } from 'react';
import { MessageSquare, User, Lock, ImageUp, Loader2 } from 'lucide-react';
import { useChat } from '../context/ChatContext.jsx';

const AVATAR_PRESETS = [
  { emoji: '😀', color: 'bg-yellow-100' },
  { emoji: '😎', color: 'bg-blue-100' },
  { emoji: '🚀', color: 'bg-purple-100' },
  { emoji: '🎨', color: 'bg-pink-100' },
  { emoji: '🌈', color: 'bg-green-100' },
  { emoji: '🦊', color: 'bg-orange-100' },
  { emoji: '🐼', color: 'bg-slate-100' },
  { emoji: '🌟', color: 'bg-amber-100' },
];

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { login, register } = useChat();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setAvatarPreview(dataUrl);
      setAvatar({ url: dataUrl, color: '#6366F1' });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      setLoading(true);
      try {
        await register(username.trim(), password, avatar);
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Registration failed');
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        await login(username.trim(), password);
      } catch (err) {
        setError(typeof err === 'string' ? err : 'Login failed');
        setLoading(false);
      }
    }
  };

  const selectPreset = (emoji) => {
    setAvatarPreview(null);
    setAvatar({ emoji, color: null });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient shadow-lg">
            <MessageSquare size={24} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-800">ChatApp</h1>
          <p className="mt-1 text-sm text-slate-400">Connect with everyone</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-glass-lg">
          <div className="mb-5 flex rounded-xl bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === 'login' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === 'signup' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Username</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  maxLength={20}
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Confirm Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">Profile Picture</label>
                  <div className="grid grid-cols-8 gap-1.5">
                    {AVATAR_PRESETS.map((p) => (
                      <button
                        key={p.emoji}
                        type="button"
                        onClick={() => selectPreset(p.emoji)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-all ${
                          avatar?.emoji === p.emoji ? 'ring-2 ring-brand-500 ring-offset-2 scale-110' : 'hover:bg-slate-100'
                        } ${p.color}`}
                      >
                        {p.emoji}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-500 transition-colors hover:bg-slate-50"
                    >
                      <ImageUp size={12} /> Upload Photo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {avatarPreview && (
                      <img src={avatarPreview} alt="Preview" className="h-8 w-8 rounded-full object-cover ring-2 ring-brand-500" />
                    )}
                    {avatar?.emoji && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-lg ring-2 ring-brand-500">
                        {avatar.emoji}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            {error && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-2.5 text-sm font-semibold text-white transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
