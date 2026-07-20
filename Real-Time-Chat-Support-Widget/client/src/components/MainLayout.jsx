import { useState } from 'react';
import { useChat } from '../context/ChatContext.jsx';
import RoomSidebar from './RoomSidebar.jsx';
import ChatWindow from './ChatWindow.jsx';
import ConnectionStatus from './ConnectionStatus.jsx';
import { MessageSquare, Copy, Check, Users, LogOut } from 'lucide-react';

function WelcomeScreen() {
  const { user } = useChat();

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-gradient-soft">
        <MessageSquare size={28} className="text-brand-600" />
      </div>
      <h2 className="font-display text-xl font-bold text-slate-800">
        Welcome, {user?.username || 'User'}!
      </h2>
      <p className="mt-2 max-w-xs text-sm text-slate-500">
        Select a chat from the sidebar or create a new room to get started.
      </p>
    </div>
  );
}

export default function MainLayout() {
  const { currentRoom, connectionStatus, user, logout } = useChat();
  const [roomCodeCopied, setRoomCodeCopied] = useState(false);

  const handleCopyRoomCode = async () => {
    if (!currentRoom) return;
    try {
      await navigator.clipboard.writeText(currentRoom.roomId);
      setRoomCodeCopied(true);
      setTimeout(() => setRoomCodeCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <RoomSidebar />

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-xs font-bold text-white">
              C
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                {currentRoom ? currentRoom.name : 'ChatApp'}
              </p>
              {currentRoom && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <ConnectionStatus status={connectionStatus} />
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Users size={10} /> {currentRoom.memberCount} online
                    </span>
                  </div>
                  <span className="text-slate-200">•</span>
                  <button
                    type="button"
                    onClick={handleCopyRoomCode}
                    className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono text-slate-500 transition-colors hover:bg-slate-200"
                  >
                    <code className="max-w-[100px] truncate">{currentRoom.roomId}</code>
                    {roomCodeCopied ? <Check size={10} /> : <Copy size={10} />}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-gradient text-[10px] font-bold text-white">
                {user?.username?.charAt(0) || '?'}
              </div>
              <span className="text-xs font-medium text-slate-600">{user?.username || 'User'}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Logout"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
            >
              <LogOut size={15} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {currentRoom ? <ChatWindow /> : <WelcomeScreen />}
        </div>
      </div>
    </div>
  );
}
